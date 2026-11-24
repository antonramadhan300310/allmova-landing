/**
 * ALLMOVA — pusat konfigurasi landing page.
 * Cukup edit nilai di file ini untuk memperbarui seluruh halaman.
 */

export const siteConfig = {
  name: "ALLMOVA",
  wordmark: "ΛLLMOVA",
  tagline: "Rekam, Analisis, dan Bagikan Performa Olahraga dalam 3D.",
  description:
    "ALLMOVA merekam aktivitas Cycling, Run, Walking, dan Hike dengan GPS presisi, lalu mengubahnya menjadi animasi rute 3D sinematik serta poster media sosial.",

  /** Versi aplikasi Android yang sedang dirilis. */
  appVersion: "v1.2.0",

  /** URL unduhan APK Android (halaman rilis GitHub). */
  apkDownloadUrl:
    "https://github.com/antonramadhan300310/strava-3d-app/releases/latest",

  /**
   * Nomor WhatsApp admin dalam format internasional tanpa tanda "+".
   * GANTI NOMOR DI BARIS INI dengan nomor WhatsApp bisnis Anda.
   * Contoh: 6281234567890 (62 = kode negara Indonesia, tanpa spasi/tanda hubung).
   */
  adminWhatsAppNumber: "6281234567890",

  /** Masa trial Pro untuk setiap pendaftar baru. */
  trialDays: 14,

  pricing: {
    monthly: {
      label: "Bulanan",
      price: 25000,
      priceLabel: "Rp 25.000",
      period: "/ bulan",
    },
    yearly: {
      label: "Tahunan",
      price: 240000,
      priceLabel: "Rp 240.000",
      originalPrice: 300000,
      originalPriceLabel: "Rp 300.000",
      period: "/ tahun",
      perMonthLabel: "Rp 20.000",
      savingsLabel: "Hemat Rp 60.000",
      discountLabel: "Hemat 20%",
    },
  },

  nav: [
    { label: "Fitur", href: "#fitur" },
    { label: "Tampilan Aplikasi", href: "#screenshots" },
    { label: "Harga & Paket", href: "#harga" },
    { label: "Cara Instal", href: "#cara-instal" },
  ],
} as const;

export type BillingCycle = "monthly" | "yearly";

/** Link WhatsApp admin dengan pesan otomatis sesuai paket yang dipilih. */
export function getWhatsAppProUrl(billingCycle: BillingCycle): string {
  const { monthly, yearly } = siteConfig.pricing;
  const plan =
    billingCycle === "monthly"
      ? `Bulanan (${monthly.priceLabel} / bulan)`
      : `Tahunan (${yearly.priceLabel} / tahun — ${yearly.discountLabel}, setara ${yearly.perMonthLabel} / bulan)`;

  const message = [
    "Halo Admin ALLMOVA,",
    "",
    `Saya ingin berlangganan ALLMOVA Pro paket ${plan}.`,
    "Mohon informasi langkah aktivasi dan pembayarannya. Terima kasih.",
  ].join("\n");

  return `https://wa.me/${siteConfig.adminWhatsAppNumber}?text=${encodeURIComponent(
    message,
  )}`;
}

/** Link WhatsApp umum untuk footer / bantuan. */
export function getWhatsAppContactUrl(): string {
  const message =
    "Halo Admin ALLMOVA, saya ingin bertanya tentang aplikasi ALLMOVA.";
  return `https://wa.me/${siteConfig.adminWhatsAppNumber}?text=${encodeURIComponent(
    message,
  )}`;
}

export const apkDownloadUrl = siteConfig.apkDownloadUrl;
