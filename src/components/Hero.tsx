import {
  Apple,
  ArrowRight,
  Bike,
  Check,
  Download,
  Footprints,
  Mountain,
  Play,
  Sparkles,
  Timer,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { siteConfig } from "@/config/site";
import type { Screenshot } from "@/lib/screenshots";

const sports = [
  { label: "Cycling", icon: Bike },
  { label: "Run", icon: Timer },
  { label: "Walking", icon: Footprints },
  { label: "Hike", icon: Mountain },
];

export function Hero({ record }: { record: Screenshot }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-grid-faint bg-[size:64px_64px] opacity-[0.55] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_72%)]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(185,245,30,0.16),transparent_65%)] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgba(60,220,190,0.10),transparent_70%)] blur-3xl" />
      </div>

      <div className="container-page grid items-center gap-14 pb-16 pt-12 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-20">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/[0.07] py-1.5 pl-2.5 pr-3.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime/90">
              Rilis Android {siteConfig.appVersion} • Tersedia Sekarang
            </span>
          </div>

          <h1 className="mt-6 text-[2.35rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.6rem]">
            Rekam, Analisis, dan
            <br className="hidden sm:block" /> Bagikan Performa Olahraga{" "}
            <span className="relative inline-block text-lime">
              dalam 3D
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-lime/80 via-lime/40 to-transparent"
              />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-base">
            Pelacakan GPS presisi untuk{" "}
            <strong className="font-semibold text-white/85">
              Cycling, Run, Walking, dan Hike
            </strong>
            . Ubah setiap rute menjadi animasi flyover 3D sinematik dan poster
            media sosial yang siap dibagikan — semuanya dari satu aplikasi.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={siteConfig.apkDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lime min-h-[52px] px-6 text-[15px] text-balance"
            >
              <Download className="h-[18px] w-[18px]" strokeWidth={2.6} />
              Download APK Android ({siteConfig.appVersion})
              <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
            </a>

            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Versi iOS masih dalam tahap pengembangan"
              className="group inline-flex min-h-[52px] cursor-not-allowed items-center justify-center gap-2.5 rounded-full border border-dashed border-white/15 bg-white/[0.02] px-5 text-[13px] font-semibold leading-tight text-white/40 sm:text-sm"
            >
              <Apple className="h-4 w-4" strokeWidth={2.2} />
              iOS App Store • Masih Dalam Pengembangan
            </button>
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-white/40">
            <span className="inline-flex items-center gap-1.5 font-semibold text-lime/85">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              {siteConfig.trialDays} hari Pro Trial
            </span>
            <span className="text-white/20">•</span>
            <span>Gratis untuk pendaftar baru</span>
            <span className="text-white/20">•</span>
            <span>Tanpa Play Store</span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2">
            {sports.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/80 px-3 py-1.5 text-[11.5px] font-semibold text-white/60"
              >
                <Icon className="h-3.5 w-3.5 text-lime" strokeWidth={2.2} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[268px] sm:max-w-[292px] lg:max-w-[308px]">
          <PhoneFrame
            src={record.base}
            sources={record.sources}
            alt="Layar perekaman GPS ALLMOVA dengan peta bersih"
            available={record.available}
            glow
            priority
          />

          <div className="pointer-events-none absolute -left-4 top-16 hidden animate-float rounded-2xl border border-hairline bg-surface/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:-left-8 sm:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
              Elevasi Gain
            </p>
            <p className="mt-0.5 text-base font-extrabold text-white">
              +842 <span className="text-[11px] font-semibold text-white/40">m</span>
            </p>
          </div>

          <div className="pointer-events-none absolute -right-3 bottom-24 hidden animate-float rounded-2xl border border-lime/25 bg-lime/[0.09] px-3.5 py-2.5 shadow-xl backdrop-blur [animation-delay:1.4s] sm:-right-6 sm:block">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-lime/80">
              <Play className="h-2.5 w-2.5 fill-lime text-lime" />
              Flyover 3D
            </p>
            <p className="mt-0.5 text-base font-extrabold text-white">MP4 HD</p>
          </div>

          <div className="pointer-events-none absolute -bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-hairline bg-charcoal/90 px-3 py-1.5 backdrop-blur sm:flex">
            <Sparkles className="h-3 w-3 text-lime" strokeWidth={2.2} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Poster 3D & Stiker
            </span>
          </div>
        </div>
      </div>

      <div className="container-page">
        <div className="section-divider" />
      </div>
    </section>
  );
}
