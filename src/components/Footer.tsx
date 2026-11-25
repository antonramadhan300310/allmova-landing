import Link from "next/link";
import { Apple, Download, Smartphone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getWhatsAppContactUrl, siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="relative border-t border-hairline bg-[#0A0E0F]">
      <div className="container-page py-12 md:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[12.5px] leading-relaxed text-white/40">
              Pelacak aktivitas GPS dengan flyover 3D, poster rute, dan analitik
              performa untuk pesepeda, pelari, pejalan, dan pendaki.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/[0.07] px-2.5 py-1 text-[10.5px] font-semibold text-lime/85">
                <Smartphone className="h-3 w-3" strokeWidth={2.4} />
                Android APK Tersedia
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 text-[10.5px] font-semibold text-white/35">
                <Apple className="h-3 w-3" strokeWidth={2.2} />
                iOS Dalam Pengembangan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <p className="eyebrow">Navigasi</p>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-[12.5px] font-medium text-white/45 transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Unduh & Bantuan</p>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                <li>
                  <a
                    href={siteConfig.apkDownloadUrl}
                    download="ALLMOVA.apk"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/45 transition-colors hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Download APK {siteConfig.appVersion}
                  </a>
                </li>
                <li>
                  <a
                    href="#cara-instal"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/45 transition-colors hover:text-white"
                  >
                    <Smartphone className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Panduan Instalasi
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <p className="text-[11.5px] text-white/30">
              © 2026 {siteConfig.name}. Seluruh hak cipta dilindungi.
            </p>
            <Link
              href="/privacy"
              className="text-[11.5px] font-semibold text-white/45 underline-offset-4 transition-colors hover:text-lime hover:underline"
            >
              Kebijakan Privasi
            </Link>
          </div>
          <a
            href={getWhatsAppContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost h-10 px-4 text-[12px]"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
            Hubungi Admin WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
