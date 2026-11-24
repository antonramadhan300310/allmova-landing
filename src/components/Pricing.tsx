"use client";

import { useState } from "react";
import {
  Check,
  Download,
  Gift,
  Minus,
  Sparkles,
  Zap,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  getWhatsAppProUrl,
  siteConfig,
  type BillingCycle,
} from "@/config/site";

const comparison = [
  {
    label: "Perekaman GPS Latar Belakang (Cycling, Run, Walk, Hike)",
    free: true,
    pro: true,
  },
  {
    label: "Poster Peta 3D & Stiker Transparan + Foto Galeri",
    free: true,
    pro: true,
  },
  {
    label: "Riwayat Aktivitas & Sinkronisasi Cloud",
    free: true,
    pro: true,
  },
  {
    label: "Perencanaan Rute Multi-Olahraga & Topografi Hike",
    free: false,
    pro: true,
  },
  {
    label: "Mode Rute Bebas (Off-Trail) & Estimasi Naismith",
    free: false,
    pro: true,
  },
  {
    label: "Heatmap Neon Multi-Warna Riwayat Aktivitas",
    free: false,
    pro: true,
  },
  {
    label: "Ekspor Video Animasi 3D Flyover (MP4)",
    free: false,
    pro: true,
  },
  {
    label: "Kalibrasi FTP, Zona Daya (Z1–Z6) & Analitik Lanjut",
    free: false,
    pro: true,
  },
];

const freeFeatures = [
  "Perekaman GPS latar belakang tanpa batas",
  "Poster peta 3D & stiker transparan",
  "Riwayat aktivitas + sinkronisasi cloud",
  `${siteConfig.trialDays} hari ALLMOVA Pro Trial saat mendaftar`,
  "Upgrade ke Pro kapan saja, tanpa kehilangan data",
];

const proFeatures = [
  "Semua fitur Free Tier",
  "Perencanaan rute & topografi hike",
  "Mode Off-Trail + estimasi Naismith",
  "Heatmap neon multi-warna",
  "Ekspor video 3D Flyover (MP4)",
  "Kalibrasi FTP & zona daya Z1–Z6",
];

function Cell({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-lime/[0.12] text-lime">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.04] text-white/25">
      <Minus className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const { monthly, yearly } = siteConfig.pricing;
  const isYearly = billing === "yearly";

  return (
    <section id="harga" className="relative scroll-mt-24 py-20 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Harga & Paket</p>
          <h2 className="mt-3 text-[1.85rem] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[2.35rem]">
            Mulai gratis, upgrade saat
            <span className="text-lime"> butuh lebih</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Tanpa biaya tersembunyi. Batalkan kapan saja dengan menghubungi
            admin.
          </p>
        </div>

        {/* Banner trial */}
        <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-lime/25 bg-lime/[0.06] p-4 sm:items-center sm:p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lime">
            <Gift className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <p className="text-[12.5px] leading-relaxed text-white/65 sm:text-[13.5px]">
            Setiap pendaftar baru otomatis mendapatkan{" "}
            <strong className="font-bold text-lime">
              {siteConfig.trialDays} Hari ALLMOVA Pro Trial
            </strong>{" "}
            gratis — otomatis beralih ke paket Free setelah {siteConfig.trialDays}{" "}
            hari jika belum berlangganan.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex justify-center">
          <div
            role="group"
            aria-label="Pilih durasi tagihan"
            className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface/80 p-1"
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              aria-pressed={billing === "monthly"}
              className={`rounded-full px-4 py-2 text-[12.5px] font-bold transition-all sm:px-5 sm:text-[13px] ${
                billing === "monthly"
                  ? "bg-lime text-charcoal shadow-[0_6px_20px_-8px_rgba(185,245,30,0.8)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {monthly.label}
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              aria-pressed={billing === "yearly"}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-bold transition-all sm:px-5 sm:text-[13px] ${
                billing === "yearly"
                  ? "bg-lime text-charcoal shadow-[0_6px_20px_-8px_rgba(185,245,30,0.8)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {yearly.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                  billing === "yearly"
                    ? "bg-charcoal/15 text-charcoal"
                    : "bg-lime/[0.12] text-lime"
                }`}
              >
                Hemat 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Free */}
          <article className="flex flex-col rounded-3xl border border-hairline bg-surface/70 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold tracking-tight text-white">
                Free Tier
              </h3>
              <span className="rounded-full border border-hairline px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                Selamanya
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/45">
              Cocok untuk merekam aktivitas harian dan berbagi poster rute.
            </p>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-[2.6rem] font-extrabold leading-none tracking-tight text-white">
                Rp 0
              </span>
              <span className="pb-1 text-[13px] font-semibold text-white/40">
                / selamanya
              </span>
            </div>

            <ul className="mt-6 flex flex-col gap-2.5">
              {freeFeatures.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13px] leading-relaxed text-white/60"
                >
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40"
                    strokeWidth={3}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-7">
              <a
                href={siteConfig.apkDownloadUrl}
                download="ALLMOVA.apk"
                className="btn-ghost min-h-[48px] w-full px-5 text-sm"
              >
                <Download className="h-4 w-4" strokeWidth={2.4} />
                Download APK Gratis
              </a>
            </div>
          </article>

          {/* Pro */}
          <article className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-lime bg-[linear-gradient(180deg,rgba(185,245,30,0.10),rgba(20,26,28,0.9)_38%)] p-6 shadow-[0_30px_80px_-40px_rgba(185,245,30,0.45)] sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(185,245,30,0.28),transparent_65%)] blur-2xl"
            />
            <div className="relative flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
                ALLMOVA Pro
                <Sparkles className="h-4 w-4 text-lime" strokeWidth={2.2} />
              </h3>
              <span className="rounded-full bg-lime px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-charcoal">
                Paling Populer
              </span>
            </div>
            <p className="relative mt-2 text-[13px] leading-relaxed text-white/50">
              Semua fitur analitik, perencanaan rute, dan ekspor 3D tanpa batas.
            </p>

            <div className="relative mt-6">
              {isYearly && (
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-white/35 line-through">
                    {yearly.originalPriceLabel}
                  </span>
                  <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-lime">
                    Diskon 20%
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                <span className="text-[2.6rem] font-extrabold leading-none tracking-tight text-white">
                  {isYearly ? yearly.priceLabel : monthly.priceLabel}
                </span>
                <span className="pb-1 text-[13px] font-semibold text-white/45">
                  {isYearly ? yearly.period : monthly.period}
                </span>
              </div>
              <p className="mt-2 h-5 text-[12px] font-semibold text-lime/80">
                {isYearly
                  ? `Setara ${yearly.perMonthLabel} / bulan • ${yearly.savingsLabel}`
                  : "Fleksibel, bayar per bulan"}
              </p>
            </div>

            <ul className="relative mt-5 grid gap-2.5 sm:grid-cols-2">
              {proFeatures.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[12.5px] leading-relaxed text-white/70"
                >
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime"
                    strokeWidth={3}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative mt-auto flex flex-col gap-2.5 pt-7">
              <a
                href={siteConfig.apkDownloadUrl}
                download="ALLMOVA.apk"
                className="btn-lime min-h-[50px] w-full px-5 text-sm"
              >
                <Zap className="h-4 w-4" strokeWidth={2.6} />
                Mulai Trial {siteConfig.trialDays} Hari (Download APK)
              </a>
              <a
                href={getWhatsAppProUrl(billing)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost min-h-[50px] w-full px-5 text-sm"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                Hubungi Admin via WhatsApp
              </a>
            </div>
          </article>
        </div>

        {/* Comparison table */}
        <div className="mt-14">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-white">
                Perbandingan fitur lengkap
              </h3>
              <p className="mt-1 text-[12.5px] text-white/40">
                Free Tier vs ALLMOVA Pro — tanpa biaya tambahan.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 text-[10.5px] font-semibold text-white/40">
              <Check className="h-3 w-3 text-lime" strokeWidth={3} />
              Termasuk
              <span className="text-white/20">|</span>
              <Minus className="h-3 w-3" strokeWidth={3} />
              Tidak tersedia
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface/50">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Tabel perbandingan fitur Free Tier dan ALLMOVA Pro
              </caption>
              <thead>
                <tr className="border-b border-hairline bg-white/[0.02]">
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/40 sm:px-6"
                  >
                    Fitur
                  </th>
                  <th
                    scope="col"
                    className="w-[72px] px-2 py-3.5 text-center text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/40 sm:w-[120px] sm:px-4"
                  >
                    Free
                  </th>
                  <th
                    scope="col"
                    className="w-[72px] px-2 py-3.5 text-center text-[10.5px] font-bold uppercase tracking-[0.16em] text-lime sm:w-[120px] sm:px-4"
                  >
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, index) => (
                  <tr
                    key={row.label}
                    className={`border-b border-hairline last:border-b-0 transition-colors hover:bg-white/[0.02] ${
                      index >= 3 ? "bg-white/[0.012]" : ""
                    }`}
                  >
                    <th
                      scope="row"
                      className="px-4 py-3.5 text-[12.5px] font-medium leading-snug text-white/70 sm:px-6 sm:text-[13px]"
                    >
                      {row.label}
                    </th>
                    <td className="px-2 py-3.5 text-center sm:px-4">
                      <Cell value={row.free} />
                    </td>
                    <td className="px-2 py-3.5 text-center sm:px-4">
                      <Cell value={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
