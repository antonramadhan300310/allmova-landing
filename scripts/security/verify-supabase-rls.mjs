#!/usr/bin/env node
/**
 * Audit keamanan RLS, RPC, dan Storage Supabase untuk panel /admin ALLMOVA.
 *
 * Skrip ini hanya memakai `fetch` murni (tanpa dependensi) dan sengaja dibuat
 * sangat ringan: maksimal ~14 request kecil (< 1 KB per body, total trafik
 * jauh di bawah 10 KB) supaya kuota Supabase tidak terbebani.
 *
 * Semua probe bersifat non-destruktif:
 *  - UPDATE memakai nilai yang sama dengan nilai saat ini (no-op) atau id yang
 *    tidak ada,
 *  - DELETE selalu menyasar id yang tidak ada,
 *  - INSERT hanya dieksekusi untuk membuktikan RLS bocor, lalu langsung dibersihkan.
 *
 * Kredensial dibaca dari NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Bila salah satu kosong, audit ditandai SKIPPED (tidak menggagalkan PR).
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const REPORT_DIR = process.env.SECURITY_REPORT_DIR || "reports";
const REQUEST_BUDGET = 16;
const REQUEST_TIMEOUT_MS = 12000;

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";
const PROBE_ROUTE_ID = "00000000-0000-0000-0000-0000000a11a1";
const STORAGE_PROBE_PATH = "ota-updates/security-probe.txt";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

const DENY_PATTERN =
  /row-level security|row level security|permission denied|unauthorized|akses ditolak|not owner|forbidden|42501|insufficient privilege/i;
const MISSING_PATTERN =
  /PGRST20[245]|PGRST301|does not exist|could not find the (?:function|table|column)|bucket not found|schema cache/i;
const INVALID_KEY_PATTERN = /invalid api key|no api key found|invalid jwt|jwt malformed/i;

const results = [];
const requestLog = { count: 0, requestBytes: 0, responseBytes: 0 };

const RPC_PROBES = [
  {
    name: "admin_list_users",
    body: {},
    note: "Daftar seluruh pengguna (email, tier, device id)",
  },
  {
    name: "admin_update_subscription",
    body: {
      p_user_id: ZERO_UUID,
      p_tier: "free",
      p_pro_expires_at: null,
      p_is_owner: false,
      p_source: "security_audit",
    },
    note: "Ubah tier / status owner pengguna",
  },
  {
    name: "admin_reset_device_session",
    body: { p_user_id: ZERO_UUID },
    note: "Reset sesi perangkat pengguna",
  },
  {
    name: "admin_list_curated_routes",
    body: {},
    note: "Daftar rute kurasi (termasuk yang draft)",
  },
  {
    name: "admin_upsert_curated_route",
    body: {
      p_id: PROBE_ROUTE_ID,
      p_name: "SECURITY-AUDIT-PROBE",
      p_city: null,
      p_sport_type: "cycling",
      p_distance_km: 0,
      p_elevation_gain_m: 0,
      p_difficulty: "easy",
      p_description: null,
      p_is_pro: false,
      p_is_active: false,
      p_coordinates: [],
    },
    note: "Buat / ubah rute kurasi",
    cleanup: { rpc: "admin_delete_curated_route", body: { p_id: PROBE_ROUTE_ID } },
  },
  {
    name: "admin_delete_curated_route",
    body: { p_id: PROBE_ROUTE_ID },
    note: "Hapus rute kurasi",
  },
];

function add(id, title, status, severity, detail, extra = {}) {
  results.push({ id, title, status, severity, detail, ...extra });
}

async function call(label, urlPath, init = {}) {
  if (requestLog.count >= REQUEST_BUDGET) {
    return { budgetExhausted: true };
  }

  const payload = init.body === undefined ? undefined : String(init.body);
  requestLog.count += 1;
  requestLog.requestBytes += payload ? Buffer.byteLength(payload) : 0;

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}${urlPath}`, {
      method: init.method || "GET",
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Accept: "application/json",
        ...(payload ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
      body: payload,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    return { networkError: true, label, message: error?.message || String(error) };
  }

  let text = "";
  try {
    text = await response.text();
  } catch {
    text = "";
  }
  requestLog.responseBytes += Buffer.byteLength(text);

  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  const errorText = [
    json && !Array.isArray(json) ? json.message : "",
    json && !Array.isArray(json) ? json.details : "",
    json && !Array.isArray(json) ? json.hint : "",
    text.slice(0, 400),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    label,
    status: response.status,
    json,
    text,
    errorText,
    code: json && !Array.isArray(json) ? String(json.code || "") : "",
  };
}

const isDenied = (res) =>
  res.status === 401 || res.status === 403 || DENY_PATTERN.test(res.errorText || "");

const isMissing = (res) =>
  res.status === 404 || res.code === "42P01" || MISSING_PATTERN.test(res.errorText || "");

const isInvalidKey = (res) => res.status === 401 && INVALID_KEY_PATTERN.test(res.errorText || "");

const isSuccess = (res) => res.status >= 200 && res.status < 300;

function sqlState(res) {
  const match = (res.errorText || "").match(/\b(2[0-9A-Z]{4}|4[0-9A-Z]{4}|P[0-9A-Z]{4})\b/);
  return res.code || (match ? match[1] : "");
}

function rowsOf(res) {
  return Array.isArray(res.json) ? res.json : [];
}

function targetLabel() {
  try {
    return new URL(SUPABASE_URL).host;
  } catch {
    return SUPABASE_URL || "(belum diatur)";
  }
}

/* ------------------------------------------------------------------ Test 1 */

async function testProfiles(state) {
  const select = await call("profiles-select", "/rest/v1/profiles?select=*&limit=1");
  if (select.budgetExhausted) return;

  if (select.networkError) {
    add("T1-SELECT", "SELECT anon pada tabel profiles", "SKIPPED", "info",
      `Tidak dapat menghubungi Supabase: ${select.message}`);
    state.offline = true;
    return;
  }

  if (isInvalidKey(select)) {
    add("T1-SELECT", "SELECT anon pada tabel profiles", "SKIPPED", "info",
      "Anon key ditolak Supabase (Invalid API key). Periksa kembali nilai NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    state.credentialsBroken = true;
    return;
  }

  if (isMissing(select)) {
    add("T1-SELECT", "SELECT anon pada tabel profiles", "SKIPPED", "info",
      "Tabel `profiles` tidak ditemukan / belum dibuat.");
    return;
  }

  const row = rowsOf(select)[0] || null;
  if (!row) {
    add("T1-SELECT", "SELECT anon pada tabel profiles", "PASS", "info",
      `Anon ditolak saat membaca \`profiles\` (HTTP ${select.status}, ${select.code || "permission denied"}).`,
      { http: select.status });
  } else {
    const sensitive = [
      "email", "plan_tier", "is_owner", "pro_expires_at", "subscription_tier",
      "tier", "active_device_id", "device_id", "subscription_source",
    ].filter((key) => key in row);

    if (sensitive.length > 0) {
      add("T1-SELECT", "SELECT anon pada tabel profiles", "FAIL", "critical",
        `Anon dapat membaca kolom sensitif: ${sensitive.map((k) => `\`${k}\``).join(", ")}.`,
        { http: select.status });
    } else {
      add("T1-SELECT", "SELECT anon pada tabel profiles", "INFO", "low",
        `Anon membaca 1 baris (kolom: ${Object.keys(row).join(", ") || "—"}). Pastikan tidak ada data pribadi.`,
        { http: select.status });
    }
  }

  const currentId = row && typeof row.id === "string" ? row.id : ZERO_UUID;

  /* --- UPDATE (no-op bila baris terlihat, id palsu bila tidak) --- */
  const noopPatch = {};
  if (row && "plan_tier" in row) noopPatch.plan_tier = row.plan_tier;
  if (row && "is_owner" in row) noopPatch.is_owner = row.is_owner;

  const updateTarget = Object.keys(noopPatch).length > 0 ? currentId : ZERO_UUID;
  const updateBody = Object.keys(noopPatch).length > 0 ? noopPatch : { plan_tier: "pro" };

  const update = await call(
    "profiles-update",
    `/rest/v1/profiles?id=eq.${encodeURIComponent(updateTarget)}&select=id`,
    { method: "PATCH", body: JSON.stringify(updateBody), headers: { Prefer: "return=representation" } },
  );

  if (!update.budgetExhausted && !update.networkError) {
    const changed = rowsOf(update);
    if (isDenied(update)) {
      add("T1-UPDATE", "UPDATE anon pada tabel profiles", "PASS", "info",
        `Anon ditolak saat mengubah \`plan_tier\`/\`is_owner\` (HTTP ${update.status}).`);
    } else if (isMissing(update)) {
      add("T1-UPDATE", "UPDATE anon pada tabel profiles", "SKIPPED", "info",
        "Tabel `profiles` tidak ditemukan.");
    } else if (changed.length > 0) {
      add("T1-UPDATE", "UPDATE anon pada tabel profiles", "FAIL", "critical",
        `Anon berhasil mengubah baris \`profiles\` (HTTP ${update.status}). Nilai yang dikirim sengaja sama dengan nilai lama sehingga data tidak berubah.`);
    } else {
      add("T1-UPDATE", "UPDATE anon pada tabel profiles", "PASS", "info",
        `Tidak ada baris yang dapat diubah anon (HTTP ${update.status}).`);
    }
  }

  /* --- INSERT --- */
  const insert = await call("profiles-insert", "/rest/v1/profiles", {
    method: "POST",
    body: JSON.stringify({ id: ZERO_UUID }),
    headers: { Prefer: "return=minimal" },
  });

  if (!insert.budgetExhausted && !insert.networkError) {
    const state4 = sqlState(insert);
    if (isDenied(insert)) {
      add("T1-INSERT", "INSERT anon pada tabel profiles", "PASS", "info",
        `Anon ditolak saat menambah baris \`profiles\` (HTTP ${insert.status}).`);
    } else if (isMissing(insert)) {
      add("T1-INSERT", "INSERT anon pada tabel profiles", "SKIPPED", "info",
        `Tabel/kolom \`profiles\` tidak sesuai dugaan (HTTP ${insert.status}).`);
    } else if (isSuccess(insert)) {
      add("T1-INSERT", "INSERT anon pada tabel profiles", "FAIL", "critical",
        `Anon berhasil MENAMBAH baris ke \`profiles\` (HTTP ${insert.status}).`);
      await call("profiles-cleanup", `/rest/v1/profiles?id=eq.${ZERO_UUID}`, { method: "DELETE" });
    } else if (/^23/.test(state4) || insert.status === 409) {
      add("T1-INSERT", "INSERT anon pada tabel profiles", "FAIL", "critical",
        `Anon lolos RLS INSERT pada \`profiles\` dan baru tertahan constraint (SQLSTATE ${state4 || insert.status}).`);
    } else {
      add("T1-INSERT", "INSERT anon pada tabel profiles", "INFO", "low",
        `Respons tidak konklusif (HTTP ${insert.status}, SQLSTATE ${state4 || "—"}).`);
    }
  }

  /* --- DELETE (selalu id yang tidak ada) --- */
  const remove = await call(
    "profiles-delete",
    `/rest/v1/profiles?id=eq.${ZERO_UUID}&select=id`,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );

  if (!remove.budgetExhausted && !remove.networkError) {
    const deleted = rowsOf(remove);
    if (isDenied(remove)) {
      add("T1-DELETE", "DELETE anon pada tabel profiles", "PASS", "info",
        `Anon ditolak saat menghapus baris \`profiles\` (HTTP ${remove.status}).`);
    } else if (isMissing(remove)) {
      add("T1-DELETE", "DELETE anon pada tabel profiles", "SKIPPED", "info",
        "Tabel `profiles` tidak ditemukan.");
    } else if (deleted.length > 0) {
      add("T1-DELETE", "DELETE anon pada tabel profiles", "FAIL", "critical",
        `Anon berhasil menghapus ${deleted.length} baris \`profiles\`.`);
    } else {
      add("T1-DELETE", "DELETE anon pada tabel profiles", "PASS", "info",
        `Tidak ada baris yang terhapus (HTTP ${remove.status}).`);
    }
  }
}

/* ------------------------------------------------------------------ Test 2 */

async function testAdminRpcs(state) {
  for (const probe of RPC_PROBES) {
    if (state.credentialsBroken || state.offline) {
      add(`T2-${probe.name}`, `RPC ${probe.name}`, "SKIPPED", "info",
        "Dilewati karena kredensial/target tidak dapat diverifikasi.");
      continue;
    }

    const res = await call(`rpc-${probe.name}`, `/rest/v1/rpc/${probe.name}`, {
      method: "POST",
      body: JSON.stringify(probe.body),
      headers: { Prefer: "return=representation" },
    });

    if (res.budgetExhausted) {
      add(`T2-${probe.name}`, `RPC ${probe.name}`, "SKIPPED", "info",
        "Batas jumlah request audit tercapai.");
      continue;
    }
    if (res.networkError) {
      add(`T2-${probe.name}`, `RPC ${probe.name}`, "SKIPPED", "info",
        `Gagal menghubungi Supabase: ${res.message}`);
      state.offline = true;
      continue;
    }

    if (isDenied(res)) {
      add(`T2-${probe.name}`, `RPC ${probe.name}`, "PASS", "info",
        `Anon ditolak (HTTP ${res.status}). ${probe.note}.`);
      continue;
    }

    if (res.status === 404 || res.code === "PGRST202" || /could not find the function/i.test(res.errorText)) {
      add(`T2-${probe.name}`, `RPC ${probe.name}`, "SKIPPED", "info",
        "RPC belum ada di database (belum di-deploy).");
      continue;
    }

    if (isSuccess(res)) {
      add(`T2-${probe.name}`, `RPC ${probe.name}`, "FAIL", "critical",
        `Anon BERHASIL memanggil RPC admin (HTTP ${res.status}). ${probe.note}.`);

      if (probe.cleanup) {
        await call(`rpc-cleanup-${probe.name}`, `/rest/v1/rpc/${probe.cleanup.rpc}`, {
          method: "POST",
          body: JSON.stringify(probe.cleanup.body),
        });
      }
      continue;
    }

    add(`T2-${probe.name}`, `RPC ${probe.name}`, "INFO", "low",
      `Respons tidak konklusif (HTTP ${res.status}, SQLSTATE ${sqlState(res) || "—"}).`);
  }
}

/* ------------------------------------------------------------------ Test 3 */

async function testCuratedRoutes(state) {
  if (state.credentialsBroken || state.offline) {
    add("T3-CURATED", "Proteksi tabel curated_routes", "SKIPPED", "info",
      "Dilewati karena kredensial/target tidak dapat diverifikasi.");
    return;
  }

  const insert = await call("curated-insert", "/rest/v1/curated_routes?select=id", {
    method: "POST",
    body: JSON.stringify({ name: "SECURITY-AUDIT-PROBE", sport_type: "cycling", is_active: false }),
    headers: { Prefer: "return=representation" },
  });

  if (insert.budgetExhausted) return;

  if (insert.networkError) {
    add("T3-INSERT", "INSERT anon pada curated_routes", "SKIPPED", "info",
      `Gagal menghubungi Supabase: ${insert.message}`);
    state.offline = true;
    return;
  }

  const insertedRows = rowsOf(insert);
  if (isDenied(insert)) {
    add("T3-INSERT", "INSERT anon pada curated_routes", "PASS", "info",
      `Anon ditolak saat menambah rute kurasi (HTTP ${insert.status}).`);
  } else if (isMissing(insert)) {
    add("T3-INSERT", "INSERT anon pada curated_routes", "SKIPPED", "info",
      `Tabel \`curated_routes\` tidak ditemukan atau skemanya berbeda (HTTP ${insert.status}).`);
  } else if (isSuccess(insert)) {
    add("T3-INSERT", "INSERT anon pada curated_routes", "FAIL", "critical",
      `Anon berhasil MENAMBAH rute kurasi (HTTP ${insert.status}).`);
    const createdId = insertedRows[0] && insertedRows[0].id;
    if (createdId) {
      await call("curated-cleanup", `/rest/v1/curated_routes?id=eq.${encodeURIComponent(createdId)}`, {
        method: "DELETE",
      });
    }
  } else if (insert.status === 409 || /^23/.test(sqlState(insert))) {
    add("T3-INSERT", "INSERT anon pada curated_routes", "FAIL", "critical",
      `Anon lolos RLS INSERT pada \`curated_routes\` (SQLSTATE ${sqlState(insert) || insert.status}).`);
  } else {
    add("T3-INSERT", "INSERT anon pada curated_routes", "INFO", "low",
      `Respons tidak konklusif (HTTP ${insert.status}).`);
  }

  const update = await call(
    "curated-update",
    `/rest/v1/curated_routes?id=eq.${ZERO_UUID}&select=id`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_active: false }),
      headers: { Prefer: "return=representation" },
    },
  );

  if (!update.budgetExhausted && !update.networkError) {
    if (isDenied(update)) {
      add("T3-UPDATE", "UPDATE anon pada curated_routes", "PASS", "info",
        `Anon ditolak saat mengubah rute kurasi (HTTP ${update.status}).`);
    } else if (rowsOf(update).length > 0) {
      add("T3-UPDATE", "UPDATE anon pada curated_routes", "FAIL", "critical",
        `Anon berhasil mengubah ${rowsOf(update).length} rute kurasi.`);
    } else {
      add("T3-UPDATE", "UPDATE anon pada curated_routes", "PASS", "info",
        `Tidak ada rute yang dapat diubah anon (HTTP ${update.status}).`);
    }
  }

  const remove = await call(
    "curated-delete",
    `/rest/v1/curated_routes?id=eq.${ZERO_UUID}&select=id`,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );

  if (!remove.budgetExhausted && !remove.networkError) {
    if (isDenied(remove)) {
      add("T3-DELETE", "DELETE anon pada curated_routes", "PASS", "info",
        `Anon ditolak saat menghapus rute kurasi (HTTP ${remove.status}).`);
    } else if (rowsOf(remove).length > 0) {
      add("T3-DELETE", "DELETE anon pada curated_routes", "FAIL", "critical",
        `Anon berhasil menghapus ${rowsOf(remove).length} rute kurasi.`);
    } else {
      add("T3-DELETE", "DELETE anon pada curated_routes", "PASS", "info",
        `Tidak ada rute yang terhapus (HTTP ${remove.status}).`);
    }
  }
}

/* ------------------------------------------------------------------ Test 4 */

async function testStorage(state) {
  if (state.credentialsBroken || state.offline) {
    add("T4-STORAGE", "Upload anon ke bucket ota-updates", "SKIPPED", "info",
      "Dilewati karena kredensial/target tidak dapat diverifikasi.");
    return;
  }

  const payload = "ALLMOVA";
  const upload = await call("storage-upload", `/storage/v1/object/${STORAGE_PROBE_PATH}`, {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "text/plain", "x-upsert": "false" },
  });

  if (upload.budgetExhausted) return;

  if (upload.networkError) {
    add("T4-STORAGE", "Upload anon ke bucket ota-updates", "SKIPPED", "info",
      `Gagal menghubungi Supabase: ${upload.message}`);
    return;
  }

  if (isSuccess(upload)) {
    add("T4-STORAGE", "Upload anon ke bucket ota-updates", "FAIL", "critical",
      `Anon berhasil MENGUNGGAH berkas ke bucket \`ota-updates\` (HTTP ${upload.status}).`);
    await call("storage-cleanup", `/storage/v1/object/${STORAGE_PROBE_PATH}`, { method: "DELETE" });
    return;
  }

  if (isDenied(upload)) {
    add("T4-STORAGE", "Upload anon ke bucket ota-updates", "PASS", "info",
      `Anon ditolak saat mengunggah berkas (HTTP ${upload.status}).`);
    return;
  }

  if (/bucket not found/i.test(upload.errorText || "")) {
    add("T4-STORAGE", "Upload anon ke bucket ota-updates", "SKIPPED", "info",
      "Bucket `ota-updates` belum ada di project Supabase ini.");
    return;
  }

  add("T4-STORAGE", "Upload anon ke bucket ota-updates", "INFO", "low",
    `Respons tidak konklusif (HTTP ${upload.status}).`);
}

/* ---------------------------------------------------------------- Reporting */

const STATUS_ICON = { PASS: "✅ PASS", FAIL: "🔴 FAIL", SKIPPED: "⏭️ SKIPPED", INFO: "ℹ️ INFO" };

function markdown(report) {
  const lines = [
    "### Supabase RLS / RPC / Storage",
    "",
    `- Target: \`${report.target}\``,
    `- Request terpakai: **${report.requests.count}** (body ${report.requests.requestBytes} B, respons ${report.requests.responseBytes} B)`,
    `- Hasil: **${report.counts.pass}** lolos · **${report.counts.fail}** gagal · ${report.counts.skipped} dilewati · ${report.counts.info} info`,
    `- Status gerbang: **${report.fatal ? "GAGAL (celah kritis)" : "LULUS"}**`,
    "",
    "| Tes | Status | HTTP | Keterangan |",
    "| --- | --- | --- | --- |",
  ];

  for (const item of report.results) {
    lines.push(
      `| ${item.title} | ${STATUS_ICON[item.status] || item.status} | ${item.http ?? "—"} | ${item.detail} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

function skippedReport(reason, guidance) {
  return {
    generatedAt: new Date().toISOString(),
    target: targetLabel(),
    status: "SKIPPED",
    reason,
    guidance,
    results: [],
    counts: { pass: 0, fail: 0, skipped: 0, info: 0 },
    fatal: false,
    requests: requestLog,
  };
}

async function writeOutputs(report) {
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(path.join(REPORT_DIR, "rls-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  const summary = report.status === "SKIPPED"
    ? [
        "### Supabase RLS / RPC / Storage",
        "",
        `⏭️ **SKIPPED** — ${report.reason}`,
        "",
        report.guidance,
        "",
      ].join("\n")
    : markdown(report);

  await writeFile(path.join(REPORT_DIR, "rls-summary.md"), summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, { flag: "a" });
  }
  console.log(summary);
}

async function main() {
  if (!SUPABASE_URL || !ANON_KEY) {
    const missing = [
      !SUPABASE_URL ? "`NEXT_PUBLIC_SUPABASE_URL`" : null,
      !ANON_KEY ? "`NEXT_PUBLIC_SUPABASE_ANON_KEY`" : null,
    ].filter(Boolean).join(" dan ");

    await writeOutputs(skippedReport(
      `${missing} belum diatur.`,
      [
        "**Cara mengaktifkan audit ini**",
        "",
        "1. Buka *Settings → Secrets and variables → Actions* di repository.",
        "2. Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`",
        "   sebagai **secret** (disarankan) atau **variable** repository.",
        "3. Jalankan ulang workflow. Gunakan **anon / publishable key**, bukan `service_role`.",
        "",
        "> PR dari fork tidak menerima secret, jadi audit ini otomatis dilewati — bukan kegagalan.",
      ].join("\n"),
    ));
    return;
  }

  const state = { credentialsBroken: false, offline: false };

  await testProfiles(state);
  await testAdminRpcs(state);
  await testCuratedRoutes(state);
  await testStorage(state);

  const counts = { pass: 0, fail: 0, skipped: 0, info: 0 };
  for (const item of results) {
    const key = item.status.toLowerCase();
    if (key in counts) counts[key] += 1;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    target: targetLabel(),
    status: state.credentialsBroken || state.offline ? "PARTIAL" : "COMPLETED",
    results,
    counts,
    fatal: counts.fail > 0,
    requests: requestLog,
  };

  await writeOutputs(report);

  if (report.fatal) {
    const failed = results.filter((item) => item.status === "FAIL");
    console.error(`\nFATAL: ${failed.length} celah kritis RLS/RPC/Storage ditemukan.`);
    for (const item of failed) console.error(` - ${item.title}: ${item.detail}`);
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error("verify-supabase-rls gagal dijalankan:", error?.message || error);
  await writeOutputs(skippedReport(
    `Skrip gagal dijalankan: ${error?.message || error}`,
    "Periksa kembali konektivitas jaringan runner dan nilai environment Supabase.",
  )).catch(() => {});
  process.exit(2);
});
