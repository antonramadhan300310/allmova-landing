#!/usr/bin/env node
/**
 * Gerbang fatal audit secret ALLMOVA.
 *
 * Gitleaks sudah memindai kode + riwayat commit, tetapi ia tidak bisa men-decode
 * JWT. Skrip ini melengkapi Gitleaks dengan:
 *   1. men-decode setiap kandidat JWT di working tree dan menandai payload
 *      dengan `role: "service_role"` sebagai FATAL (bypass seluruh RLS),
 *   2. mendeteksi private key dan kredensial admin hardcoded secara mandiri,
 *   3. mengklasifikasikan temuan reports/gitleaks.json menjadi fatal / report-only.
 *
 * Nilai secret tidak pernah dicetak atau disimpan — hanya lokasi dan jenisnya.
 */

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const REPORT_DIR = process.env.SECURITY_REPORT_DIR || "reports";

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "out",
  "reports",
  "coverage",
  ".vercel",
  ".turbo",
]);

const SKIP_EXTENSIONS = new Set([
  ".apk", ".zip", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
  ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".webm", ".mp3", ".pdf",
  ".jar", ".class", ".so", ".dll", ".exe", ".bin", ".lock",
]);

const MAX_FILE_BYTES = 1024 * 1024;

const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const PRIVATE_KEY_PATTERN = /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/;
const ADMIN_CREDENTIAL_PATTERN =
  /(?:admin[_-]?(?:password|passwd|pwd|secret|token|api[_-]?key)|(?:password|passwd|pwd)\s*(?:untuk\s*)?admin)\s*[:=]\s*["'][^"'\s]{8,}["']/i;

const FATAL_RULE_PATTERN = /private-key|service[_-]?role|admin[_-]?credential/i;

const findings = [];
const scanned = { files: 0, skipped: 0 };

function lineOf(text, index) {
  return text.slice(0, Math.max(index, 0)).split("\n").length;
}

function decodeJwtRole(token) {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    );
    return typeof payload === "object" && payload !== null ? payload : null;
  } catch {
    return null;
  }
}

function inspect(file, text) {
  for (const match of text.matchAll(JWT_PATTERN)) {
    const payload = decodeJwtRole(match[0]);
    if (!payload) continue;
    const role = typeof payload.role === "string" ? payload.role : "";
    if (role === "service_role") {
      findings.push({
        severity: "fatal",
        kind: "jwt-service-role",
        file,
        line: lineOf(text, match.index ?? 0),
        detail: "JWT dengan role service_role (melewati seluruh RLS)",
      });
    } else if (role && role !== "anon") {
      findings.push({
        severity: "medium",
        kind: "jwt-unexpected-role",
        file,
        line: lineOf(text, match.index ?? 0),
        detail: `JWT dengan role "${role}" ditemukan di kode`,
      });
    }
  }

  if (PRIVATE_KEY_PATTERN.test(text)) {
    findings.push({
      severity: "fatal",
      kind: "private-key",
      file,
      line: lineOf(text, text.search(PRIVATE_KEY_PATTERN)),
      detail: "Blok private key ditemukan di repository",
    });
  }

  if (ADMIN_CREDENTIAL_PATTERN.test(text)) {
    findings.push({
      severity: "fatal",
      kind: "hardcoded-admin-credential",
      file,
      line: lineOf(text, text.search(ADMIN_CREDENTIAL_PATTERN)),
      detail: "Kredensial admin hardcoded",
    });
  }
}

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full);
      continue;
    }
    if (!entry.isFile()) continue;
    if (SKIP_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      scanned.skipped += 1;
      continue;
    }

    let info;
    try {
      info = await stat(full);
    } catch {
      continue;
    }
    if (info.size > MAX_FILE_BYTES) {
      scanned.skipped += 1;
      continue;
    }

    let text;
    try {
      text = await readFile(full, "utf8");
    } catch {
      scanned.skipped += 1;
      continue;
    }
    if (text.includes("\u0000")) {
      scanned.skipped += 1;
      continue;
    }

    scanned.files += 1;
    inspect(path.relative(ROOT, full), text);
  }
}

async function readGitleaksReport() {
  const candidates = [
    process.env.GITLEAKS_FULL_REPORT,
    path.join(REPORT_DIR, "gitleaks.json"),
    path.join(REPORT_DIR, "gitleaks-report.json"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(await readFile(candidate, "utf8"));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      continue;
    }
  }
  return null;
}

function classifyGitleaks(entries) {
  const summary = { total: entries.length, fatal: 0, reportOnly: 0, allowed: 0, rules: {} };

  for (const entry of entries) {
    const rule = String(entry.RuleID || entry.ruleId || "unknown");
    summary.rules[rule] = (summary.rules[rule] || 0) + 1;

    const finding = {
      kind: `gitleaks:${rule}`,
      file: String(entry.File || entry.file || "?"),
      line: entry.StartLine || entry.startLine || 0,
      detail: String(entry.Description || entry.description || "temuan Gitleaks"),
    };

    // Laporan lengkap (tanpa redaksi, hanya di runner) memungkinkan decoding JWT
    // dari riwayat commit — satu-satunya cara mendeteksi service_role di history.
    const secret = String(entry.Secret || entry.secret || "");
    const payload = secret.includes(".") ? decodeJwtRole(secret) : null;
    const role = payload && typeof payload.role === "string" ? payload.role : "";

    if (role === "service_role") {
      summary.fatal += 1;
      findings.push({ severity: "fatal", ...finding, detail: "JWT service_role pada riwayat commit" });
      continue;
    }
    if (role === "anon") {
      summary.allowed += 1;
      continue;
    }

    if (FATAL_RULE_PATTERN.test(rule)) {
      summary.fatal += 1;
      findings.push({ severity: "fatal", ...finding });
    } else {
      summary.reportOnly += 1;
      findings.push({ severity: "low", ...finding });
    }
  }

  return summary;
}

function markdown(report, gitleaks) {
  const fatal = findings.filter((item) => item.severity === "fatal");
  const other = findings.filter((item) => item.severity !== "fatal");

  const lines = [
    "### Secret & Kredensial",
    "",
    `- Berkas diperiksa: **${scanned.files}** (dilewati: ${scanned.skipped})`,
    gitleaks
      ? `- Gitleaks: **${gitleaks.total}** temuan (fatal: ${gitleaks.fatal}, report-only: ${gitleaks.reportOnly}, JWT anon diizinkan: ${gitleaks.allowed})`
      : "- Gitleaks: laporan tidak tersedia",
    `- Status gerbang: **${fatal.length > 0 ? "GAGAL (fatal)" : "LULUS"}**`,
    "",
  ];

  if (findings.length > 0) {
    lines.push("| Tingkat | Jenis | Lokasi | Keterangan |", "| --- | --- | --- | --- |");
    for (const item of [...fatal, ...other].slice(0, 50)) {
      const level = item.severity === "fatal" ? "🔴 fatal" : item.severity;
      lines.push(`| ${level} | \`${item.kind}\` | \`${item.file}:${item.line}\` | ${item.detail} |`);
    }
    if (findings.length > 50) {
      lines.push("", `_…dan ${findings.length - 50} temuan lain (lihat artifact)._`);
    }
  } else {
    lines.push("_Tidak ada secret, private key, atau kredensial admin hardcoded._");
  }

  lines.push("", `Jumlah temuan: **${report.total}**`, "");
  return lines.join("\n");
}

async function main() {
  await walk(ROOT);

  const gitleaksEntries = await readGitleaksReport();
  const gitleaksSummary = gitleaksEntries ? classifyGitleaks(gitleaksEntries) : null;

  // Temuan JWT yang sama bisa muncul dari pemindaian working tree dan riwayat
  // commit — simpan satu saja agar rapor tetap ringkas.
  const treeJwt = new Set(
    findings
      .filter((item) => item.kind === "jwt-service-role")
      .map((item) => `${item.file}:${item.line}`),
  );
  const deduped = findings.filter(
    (item) => !(item.kind === "gitleaks:jwt" && treeJwt.has(`${item.file}:${item.line}`)),
  );
  findings.length = 0;
  findings.push(...deduped);

  const fatal = findings.filter((item) => item.severity === "fatal");

  const report = {
    generatedAt: new Date().toISOString(),
    scanned,
    gitleaks: gitleaksSummary,
    findings,
    fatal: fatal.length > 0,
    total: findings.length,
  };

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(path.join(REPORT_DIR, "secrets-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  const summary = markdown(report, gitleaksSummary);
  await writeFile(path.join(REPORT_DIR, "sast-secrets-summary.md"), summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, { flag: "a" });
  }

  console.log(summary);

  if (report.fatal) {
    console.error(`\nFATAL: ${fatal.length} kebocoran secret/kredensial fatal ditemukan. Job digagalkan.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("scan-secrets gagal dijalankan:", error?.message || error);
  process.exit(2);
});
