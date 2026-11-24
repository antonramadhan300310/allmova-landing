import { Download, Info, ShieldCheck, Smartphone } from "lucide-react";
import { siteConfig } from "@/config/site";

const steps = [
  {
    number: "01",
    title: "Unduh File APK",
    body: "Ketuk tombol Download APK Android di halaman ini dan tunggu hingga file selesai diunduh.",
    icon: Download,
  },
  {
    number: "02",
    title: "Izinkan Instalasi dari Sumber Ini",
    body: "Buka file APK; jika muncul peringatan keamanan Android, ketuk Setelan dan aktifkan Izinkan dari sumber ini (Allow from this source).",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Instal & Nikmati Trial 14 Hari",
    body: "Ketuk Instal, buka ALLMOVA, dan buat akun baru untuk otomatis mendapatkan 14 Hari ALLMOVA Pro Trial.",
    icon: Smartphone,
  },
];

export function InstallGuide() {
  return (
    <section id="cara-instal" className="relative scroll-mt-24 py-20 md:py-24">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow">Panduan Instalasi</p>
            <h2 className="mt-3 text-[1.85rem] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[2.35rem]">
              Cara instal APK Android
              <span className="text-lime"> dalam 3 langkah</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
              ALLMOVA didistribusikan langsung sebagai file APK, bukan lewat Play
              Store. Prosesnya aman dan hanya butuh waktu kurang dari dua menit.
            </p>

            <a
              href={siteConfig.apkDownloadUrl}
              download="ALLMOVA.apk"
              className="btn-lime mt-6 min-h-[48px] px-5 text-sm"
            >
              <Download className="h-4 w-4" strokeWidth={2.6} />
              Download APK Android ({siteConfig.appVersion})
            </a>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-hairline bg-surface/60 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-lime" strokeWidth={2.2} />
              <p className="text-[12.5px] leading-relaxed text-white/45">
                Pembaruan fitur berikutnya otomatis masuk di dalam aplikasi tanpa
                perlu unduh ulang APK.
              </p>
            </div>
          </div>

          <ol className="relative flex flex-col gap-4">
            <span
              aria-hidden="true"
              className="absolute bottom-10 left-[27px] top-10 hidden w-px bg-gradient-to-b from-lime/40 via-white/10 to-transparent sm:block"
            />
            {steps.map(({ number, title, body, icon: Icon }) => (
              <li
                key={number}
                className="group relative flex gap-4 rounded-3xl border border-hairline bg-surface/70 p-5 transition-colors duration-300 hover:border-lime/25 hover:bg-surface sm:gap-5 sm:p-6"
              >
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-lime/20 bg-lime/[0.08] text-lime transition-colors group-hover:border-lime/40 group-hover:bg-lime/[0.12]">
                  <Icon className="h-5 w-5" strokeWidth={2.1} />
                  <span className="absolute -right-1.5 -top-1.5 rounded-full border border-hairline bg-charcoal px-1.5 py-0.5 font-mono text-[9px] font-bold text-white/50">
                    {number}
                  </span>
                </div>
                <div className="pt-0.5">
                  <h3 className="text-[15px] font-bold tracking-tight text-white sm:text-base">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                    {body}
                  </p>
                </div>
              </li>
            ))}
            <li className="rounded-2xl border border-dashed border-lime/20 bg-lime/[0.04] px-5 py-4 text-[12.5px] leading-relaxed text-lime/70">
              Langkah 3 sekaligus mengaktifkan{" "}
              <strong className="font-bold text-lime">
                {siteConfig.trialDays} Hari ALLMOVA Pro Trial
              </strong>{" "}
              — seluruh fitur Pro terbuka penuh, lalu otomatis beralih ke paket
              Free bila belum berlangganan.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
