#!/usr/bin/env node
/**
 * Penyusun rapor gabungan audit keamanan ALLMOVA.
 *
 * Menggabungkan artefak dari job SAST, DAST pasif, dan Supabase RLS menjadi
 * satu tabel Markdown untuk $GITHUB_STEP_SUMMARY, sekaligus menegakkan gerbang
 * fatal (secret fatal atau celah kritis RLS/RPC/Storage).
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const REPORT_DIR = process.env.SECURITY_REPORT_DIR || "reports";
const SUMMARY_FILE = path.join(REPORT_DIR, "web-security-audit-summary.md");

const REQUIRED_HEADERS = [
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Strict-Transport-Security",
];

async function readJson(...candidates) {
  for (const candidate of candidates) {
    try {
      return JSON.parse(await readFile(path.join(REPORT_DIR, candidate), "utf8"));
    } catch {
      continue;
    }
  }
  return null;
}

async function checkRepoHeaders() {
  const files = ["next.config.mjs", "next.config.js", "next.config.ts", "vercel.json"];
  for (const file of files) {
    let text;
    try {
      text = await readFile(file, "utf8");
    } catch {
      continue;
    }
    const lower = text.toLowerCase();
    const present = REQUIRED_HEADERS.filter((header) => lower.includes(header.toLowerCase()));
    return { file, present, missing: REQUIRED_HEADERS.filter((h) => !present.includes(h)) };
  }
  return { file: null, present: [], missing: REQUIRED_HEADERS };
}

function countSemgrep(report) {
  const counts = { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  if (!report || !Array.isArray(report.results)) return counts;
  counts.total = report.results.length;
  for (const result of report.results) {
    const severity = String(result?.extra?.severity || "INFO").toLowerCase();
    const bucket =
      severity === "error" ? "high" : severity === "warning" ? "medium" : severity in counts ? severity : "info";
    counts[bucket] += 1;
  }
  return counts;
}

function countNpmAudit(report) {
  const vulns = report?.metadata?.vulnerabilities || null;
  if (!vulns) {
    const direct = report?.vulnerabilities || {};
    const entries = Object.values(direct).map((item) => item?.severity).filter(Boolean);
    if (entries.length === 0) return null;
    const counts = { total: entries.length, critical: 0, high: 0, moderate: 0, low: 0 };
    for (const severity of entries) {
      if (severity in counts) counts[severity] += 1;
    }
    return counts;
  }
  return {
    total: vulns.total ?? 0,
    critical: vulns.critical ?? 0,
    high: vulns.high ?? 0,
    moderate: vulns.moderate ?? 0,
    low: vulns.low ?? 0,
  };
}

function countZap(report) {
  const counts = { total: 0, high: 0, medium: 0, low: 0, informational: 0 };
  const sites = Array.isArray(report?.site) ? report.site : report?.site ? [report.site] : [];
  for (const site of sites) {
    const alerts = Array.isArray(site?.alerts) ? site.alerts : [];
    for (const alert of alerts) {
      counts.total += 1;
      const risk = String(alert?.riskcode ?? alert?.risk ?? "").toLowerCase();
      if (risk === "3" || risk === "high") counts.high += 1;
      else if (risk === "2" || risk === "medium") counts.medium += 1;
      else if (risk === "1" || risk === "low") counts.low += 1;
      else counts.informational += 1;
    }
  }
  return counts;
}

function badge(ok, warn = false) {
  if (ok) return "✅ Lulus";
  return warn ? "⚠️ Perlu perhatian" : "🔴 Gagal";
}

async function main() {
  const secrets = await readJson("secrets-report.json");
  const gitleaks = await readJson("gitleaks.json");
  const semgrep = await readJson("semgrep.json");
  const npmAudit = await readJson("npm-audit.json");
  const rls = await readJson("rls-report.json");
  const headers = await readJson("headers.json");
  const zap = await readJson("zap-report.json");
  const repoHeaders = await checkRepoHeaders();

  const semgrepCounts = countSemgrep(semgrep);
  const npmCounts = countNpmAudit(npmAudit);
  const zapCounts = countZap(zap);

  const fatalSecrets = Boolean(secrets?.fatal);
  const fatalRls = Boolean(rls?.fatal);
  const fatal = fatalSecrets || fatalRls;

  const rows = [];

  rows.push([
    "Secret & kredensial",
    secrets
      ? badge(!fatalSecrets)
      : "⏭️ Tidak tersedia",
    secrets
      ? `${secrets.total ?? 0} temuan · Gitleaks ${gitleaks ? `${gitleaks.length} entri` : "n/a"}`
      : "Job SAST tidak menghasilkan laporan",
  ]);

  rows.push([
    "SAST Semgrep",
    semgrep ? (semgrepCounts.high + semgrepCounts.critical > 0 ? "⚠️ Perlu perhatian" : "✅ Lulus") : "⏭️ Tidak tersedia",
    semgrep
      ? `${semgrepCounts.total} temuan (critical ${semgrepCounts.critical}, high ${semgrepCounts.high}, medium ${semgrepCounts.medium})`
      : "Job SAST tidak menghasilkan laporan",
  ]);

  rows.push([
    "Dependensi (npm audit)",
    npmCounts ? (npmCounts.critical + npmCounts.high > 0 ? "⚠️ Perlu perhatian" : "✅ Lulus") : "⏭️ Tidak tersedia",
    npmCounts
      ? `total ${npmCounts.total} (critical ${npmCounts.critical}, high ${npmCounts.high}, moderate ${npmCounts.moderate})`
      : "Tidak ada laporan npm audit",
  ]);

  rows.push([
    "DAST pasif (headers)",
    headers ? (headers.missing > 0 ? "⚠️ Perlu perhatian" : "✅ Lulus") : "⏭️ Dilewati",
    headers
      ? `${headers.missing} header belum optimal · APK ${headers.apk?.ok ? "OK" : "perlu dicek"}`
      : "Hanya berjalan pada workflow_dispatch (run_dast=true)",
  ]);

  rows.push([
    "DAST pasif (OWASP ZAP)",
    zap ? (zapCounts.high > 0 ? "⚠️ Perlu perhatian" : "✅ Lulus") : "⏭️ Dilewati",
    zap
      ? `${zapCounts.total} alert (high ${zapCounts.high}, medium ${zapCounts.medium}, low ${zapCounts.low})`
      : "Hanya berjalan pada workflow_dispatch (run_dast=true)",
  ]);

  rows.push([
    "Supabase RLS / RPC / Storage",
    rls ? (fatalRls ? badge(false) : rls.status === "SKIPPED" ? "⏭️ SKIPPED" : badge(true)) : "⏭️ Tidak tersedia",
    rls
      ? `${rls.counts?.pass ?? 0} lolos · ${rls.counts?.fail ?? 0} gagal · ${rls.counts?.skipped ?? 0} dilewati`
      : "Job audit Supabase tidak menghasilkan laporan",
  ]);

  const lines = [
    "# Rapor Audit Keamanan ALLMOVA",
    "",
    `Dibuat: \`${new Date().toISOString()}\``,
    "",
    "## Ringkasan",
    "",
    "| Area | Hasil | Detail |",
    "| --- | --- | --- |",
    ...rows.map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`),
    "",
    `**Gerbang fatal:** ${fatal ? "🔴 GAGAL — ada kebocoran secret fatal atau celah kritis RLS/RPC/Storage." : "✅ LULUS — tidak ada temuan fatal."}`,
    "",
    "## Quick Wins — Security Headers di repository",
    "",
    repoHeaders.file
      ? [
          `Konfigurasi terdeteksi: \`${repoHeaders.file}\``,
          "",
          "| Header | Status |",
          "| --- | --- |",
          ...REQUIRED_HEADERS.map(
            (header) => `| ${header} | ${repoHeaders.present.includes(header) ? "✅ ada" : "🔴 belum ada"} |`,
          ),
        ].join("\n")
      : "Tidak ada `next.config.*` maupun `vercel.json` di repository.",
    "",
    "> Header ini tidak memblokir koneksi ke `*.supabase.co`, Google OAuth, maupun unduhan APK di `/downloads/` karena tidak ada `Content-Security-Policy` yang membatasi `connect-src`.",
    "",
    "## Lampiran",
    "",
    "- `secrets-report.json` — klasifikasi secret & JWT",
    "- `gitleaks.json` — temuan Gitleaks (kode + riwayat commit)",
    "- `semgrep.json` — temuan SAST Semgrep",
    "- `npm-audit.json` — hasil `npm audit`",
    "- `headers.json` + `headers-summary.md` — DAST pasif header",
    "- `zap-report.html` / `zap-report.json` — OWASP ZAP baseline (pasif)",
    "- `rls-report.json` + `rls-summary.md` — audit RLS/RPC/Storage Supabase",
    "",
  ];

  const summary = lines.join("\n");

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(SUMMARY_FILE, summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, { flag: "a" });
  }
  console.log(summary);

  if (fatal) {
    console.error("\nFATAL: rapor gabungan menandai temuan kritis. Job digagalkan.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("build-summary gagal:", error?.message || error);
  process.exit(2);
});
