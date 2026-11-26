#!/usr/bin/env node
/**
 * Pemeriksa HTTP Security Headers untuk ALLMOVA (report-only).
 *
 * Memeriksa halaman utama, panel /admin, dan memastikan unduhan APK di
 * /downloads/ tetap berfungsi setelah header keamanan ditambahkan.
 * Exit code 0 secara default (medium/low hanya dilaporkan); pakai --strict
 * bila ingin gagal saat ada header wajib yang hilang.
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const REPORT_DIR = process.env.SECURITY_REPORT_DIR || "reports";
const TARGET_URL = (process.env.TARGET_URL || "https://allmova.vercel.app").replace(/\/+$/, "");
const STRICT = process.argv.includes("--strict");
const TIMEOUT_MS = 15000;

const REQUIRED_HEADERS = [
  {
    key: "x-content-type-options",
    label: "X-Content-Type-Options",
    severity: "medium",
    ok: (value) => /nosniff/i.test(value || ""),
    hint: "harus bernilai `nosniff`",
  },
  {
    key: "x-frame-options",
    label: "X-Frame-Options",
    severity: "medium",
    ok: (value, headers) =>
      /^(deny|sameorigin)$/i.test((value || "").trim()) ||
      /frame-ancestors/i.test(headers.get("content-security-policy") || ""),
    hint: "`DENY` atau `SAMEORIGIN`",
  },
  {
    key: "referrer-policy",
    label: "Referrer-Policy",
    severity: "low",
    ok: (value) => /strict-origin-when-cross-origin|strict-origin|no-referrer|same-origin/i.test(value || ""),
    hint: "`strict-origin-when-cross-origin`",
  },
  {
    key: "permissions-policy",
    label: "Permissions-Policy",
    severity: "low",
    ok: (value) => (value || "").trim().length > 0,
    hint: "membatasi camera/microphone/geolocation",
  },
  {
    key: "strict-transport-security",
    label: "Strict-Transport-Security",
    severity: "medium",
    ok: (value) => /max-age=\d{6,}/i.test(value || ""),
    hint: "`max-age` minimal 6 digit",
  },
];

async function fetchPage(url, method = "GET") {
  try {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      cache: "no-store",
      headers: { "User-Agent": "ALLMOVA-Security-Audit/1.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (method === "GET") {
      await response.arrayBuffer();
    }
    return { ok: true, status: response.status, headers: response.headers, url: response.url };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}

function evaluate(page) {
  const checks = REQUIRED_HEADERS.map((spec) => {
    const value = page.headers.get(spec.key);
    return {
      header: spec.label,
      present: Boolean(value),
      value: value || null,
      ok: spec.ok(value, page.headers),
      severity: spec.severity,
      hint: spec.hint,
    };
  });

  const csp = page.headers.get("content-security-policy");
  return {
    url: page.url,
    status: page.status,
    checks,
    info: {
      contentSecurityPolicy: csp ? "ada" : "tidak ada (opsional, tidak wajib untuk audit ini)",
      server: page.headers.get("server") || null,
      xVercelCache: page.headers.get("x-vercel-cache") || null,
    },
    missing: checks.filter((check) => !check.ok),
  };
}

async function checkApk() {
  const url = `${TARGET_URL}/downloads/ALLMOVA.apk`;
  const result = await fetchPage(url, "HEAD");
  if (!result.ok) {
    return { url, ok: false, detail: `Tidak dapat dihubungi: ${result.error}` };
  }
  const contentType = result.headers.get("content-type") || "";
  const isHtml = /text\/html/i.test(contentType);
  return {
    url,
    status: result.status,
    contentType: contentType || "(kosong)",
    contentLength: result.headers.get("content-length"),
    ok: result.status === 200 && !isHtml,
    detail:
      result.status === 200 && !isHtml
        ? "Unduhan APK tetap tersedia dan tidak disajikan sebagai HTML."
        : `Status ${result.status}, content-type ${contentType || "(kosong)"} — periksa kembali.`,
  };
}

function markdown(report) {
  const lines = [
    "### DAST Pasif — HTTP Security Headers",
    "",
    `Target: \`${report.target}\``,
    "",
    "| Halaman | Header | Status | Nilai |",
    "| --- | --- | --- | --- |",
  ];

  for (const page of report.pages) {
    for (const check of page.checks) {
      const icon = check.ok ? "✅" : check.present ? "⚠️" : "🔴";
      const value = check.value ? `\`${check.value.slice(0, 80)}\`` : `_hilang_ (${check.hint})`;
      lines.push(`| ${page.url.replace(report.target, "") || "/"} | ${check.header} | ${icon} | ${value} |`);
    }
  }

  lines.push("", "**Unduhan APK**", "");
  lines.push(
    `- ${report.apk.ok ? "✅" : "🔴"} \`${report.apk.url}\` → ${report.apk.detail}`,
  );

  if (report.errors.length > 0) {
    lines.push("", "**Halaman yang gagal diperiksa**", "");
    for (const error of report.errors) lines.push(`- \`${error.url}\`: ${error.error}`);
  }

  const missing = report.pages.reduce((total, page) => total + page.missing.length, 0);
  lines.push(
    "",
    `Ringkasan: **${missing}** header wajib belum optimal (severity medium/low → report-only).`,
    "",
  );
  return lines.join("\n");
}

async function main() {
  const pages = [];
  const errors = [];

  for (const suffix of ["", "/admin"]) {
    const url = `${TARGET_URL}${suffix}`;
    const result = await fetchPage(url);
    if (!result.ok) {
      errors.push({ url, error: result.error });
      continue;
    }
    pages.push(evaluate(result));
  }

  const apk = await checkApk();
  const report = {
    generatedAt: new Date().toISOString(),
    target: TARGET_URL,
    pages,
    apk,
    errors,
    missing: pages.reduce((total, page) => total + page.missing.length, 0),
  };

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(path.join(REPORT_DIR, "headers.json"), `${JSON.stringify(report, null, 2)}\n`);

  const summary = markdown(report);
  await writeFile(path.join(REPORT_DIR, "headers-summary.md"), summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, { flag: "a" });
  }
  console.log(summary);

  if (errors.length > 0 && pages.length === 0) {
    console.error("Tidak ada halaman yang berhasil diperiksa.");
    process.exit(STRICT ? 1 : 0);
  }
  if (STRICT && (report.missing > 0 || !apk.ok)) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("check-security-headers gagal:", error?.message || error);
  process.exit(STRICT ? 2 : 0);
});
