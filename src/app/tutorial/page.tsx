import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, Mail, Smartphone } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { TutorialAccordion } from "@/components/tutorial/TutorialAccordion";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getWhatsAppContactUrl, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Panduan Penggunaan — ALLMOVA" },
  description:
    "Panduan penggunaan ALLMOVA: cara merekam aktivitas dengan GPS stabil, eksplorasi rute & 3D Flyover, import/export GPX, kalibrasi FTP, status akun Trial/Free/PRO, dan update OTA.",
  alternates: { canonical: "/tutorial" },
  openGraph: {
    type: "article",
    locale: "id_ID",
    url: "/tutorial",
    siteName: siteConfig.name,
    title: "Panduan Penggunaan — ALLMOVA",
    description:
      "Langkah praktis memakai ALLMOVA dari HP: rekam aktivitas, rute 3D, GPX, profil atlet, status langganan, dan update OTA.",
  },
};

export default function TutorialPage() {
  const mailto = `mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(
    "Bantuan Penggunaan Aplikasi — ALLMOVA",
  )}`;

  return (
    <div className="relative flex min-h-screen flex-col bg-charcoal">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-faint bg-[size:64px_64px] opacity-[0.5] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_72%)]" />
        <div className="absolute -top-40 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(185,245,30,0.14),transparent_65%)] blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-hairline bg-charcoal/85 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.02] px-3 py-2 text-[12.5px] font-semibold text-white/75 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white sm:px-4 sm:text-[13px]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2.4} />
            <span className="whitespace-nowrap">Kembali ke Beranda</span>
          </Link>
          <Logo href="/" size="sm" />
        </div>
      </header>

      <main className="flex-1">
        <div className="container-page pb-16 pt-8 sm:pt-12">
          <div className="mx-auto max-w-3xl">
            <span className="eyebrow">Panduan Penggunaan</span>
            <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-[2.6rem]">
              Panduan Penggunaan <span className="text-lime">ALLMOVA</span>
            </h1>
            <p className="mt-3.5 max-w-xl text-[14px] leading-relaxed text-white/60 sm:text-[15px]">
              Enam topik singkat dan praktis: dari merekam aktivitas pertama,
              menjelajah rute 3D, mengelola file GPX, sampai mengaktifkan PRO.
              Nyaman dibaca langsung dari layar HP.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/[0.07] px-3 py-1.5 text-[11px] font-semibold text-lime/90">
                <Smartphone className="h-3.5 w-3.5" strokeWidth={2.4} />
                Android · {siteConfig.appVersion}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[11px] font-semibold text-white/40">
                6 topik · ketuk untuk membuka
              </span>
            </div>

            <TutorialAccordion />

            <section
              aria-labelledby="bantuan-title"
              className="mt-8 rounded-3xl border border-hairline bg-surface/70 p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-lime/20 bg-lime/[0.08] text-lime"
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <h2
                    id="bantuan-title"
                    className="text-base font-bold tracking-tight text-white sm:text-[17px]"
                  >
                    Masih butuh bantuan?
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                    Tim Admin ALLMOVA siap membantu lewat WhatsApp atau email.
                    Sertakan versi aplikasi ({siteConfig.appVersion}) dan model
                    HP Anda agar penanganan lebih cepat.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={getWhatsAppContactUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-lime h-12 w-full px-4 text-[13px] sm:w-auto"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  Chat Admin via WhatsApp
                </a>
                <a
                  href={mailto}
                  className="btn-ghost h-12 w-full min-w-0 px-4 text-[13px] sm:w-auto"
                >
                  <Mail className="h-4 w-4 shrink-0 text-lime" strokeWidth={2.2} />
                  <span className="truncate">{siteConfig.supportEmail}</span>
                </a>
              </div>

              <a
                href={siteConfig.apkDownloadUrl}
                download="ALLMOVA.apk"
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/45 transition-colors hover:text-lime"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.4} />
                Unduh APK versi terbaru ({siteConfig.appVersion})
              </a>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
