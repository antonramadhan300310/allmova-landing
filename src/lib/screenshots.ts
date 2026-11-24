import fs from "node:fs";
import path from "node:path";

/** Urutan ekstensi yang dicoba saat memuat gambar screenshot. */
export const SCREENSHOT_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

export type Screenshot = {
  /** Path dasar tanpa ekstensi, mis. `/screenshots/1-record`. */
  base: string;
  /** Kandidat URL berurutan; ekstensi yang sudah ada dicoba lebih dulu. */
  sources: string[];
  /** True bila minimal satu ekstensi ditemukan saat build. */
  available: boolean;
  title: string;
  caption: string;
};

type ScreenshotSlot = Pick<Screenshot, "base" | "title" | "caption">;

const slots: ScreenshotSlot[] = [
  {
    base: "/screenshots/1-record",
    title: "Perekaman GPS & Peta Bersih",
    caption:
      "Layar rekam tanpa distraksi: jarak, durasi, kecepatan, dan elevasi langsung terbaca.",
  },
  {
    base: "/screenshots/2-routes-hike",
    title: "Perencanaan Rute & Jalur Hike",
    caption:
      "Susun rute multi-olahraga, ikuti jalur setapak pendakian, dan lihat estimasi Naismith.",
  },
  {
    base: "/screenshots/3-poster-3d",
    title: "Poster Peta 3D ALLMOVA",
    caption:
      "Ekspor kartu rute 3D siap unggah dengan tipografi statistik yang rapi.",
  },
  {
    base: "/screenshots/4-stiker-foto",
    title: "Stiker Transparan di Atas Foto",
    caption:
      "Tempel statistik transparan di atas foto galeri dengan kontrol geser dan zoom.",
  },
  {
    base: "/screenshots/5-profil-ftp",
    title: "Profil Atlet, Kalibrasi FTP & Zona Daya",
    caption:
      "Kalibrasi FTP, pantau zona daya Z1–Z6, dan lacak perkembangan performa.",
  },
];

/**
 * Tambahkan versi berbasis mtime + ukuran file agar gambar yang baru diunggah
 * tidak tertahan cache browser/CDN setelah deploy berikutnya.
 */
function withCacheBust(url: string, filePath: string): string {
  try {
    const { mtimeMs, size } = fs.statSync(filePath);
    return `${url}?v=${Math.round(mtimeMs).toString(36)}${size.toString(36)}`;
  } catch {
    return url;
  }
}

function resolveSlot(slot: ScreenshotSlot): Screenshot {
  const publicDir = path.join(process.cwd(), "public");
  const existing: string[] = [];
  const missing: string[] = [];

  for (const ext of SCREENSHOT_EXTENSIONS) {
    const url = `${slot.base}.${ext}`;
    const filePath = path.join(publicDir, url);
    if (fs.existsSync(filePath)) {
      existing.push(withCacheBust(url, filePath));
    } else {
      missing.push(url);
    }
  }

  return {
    ...slot,
    sources: [...existing, ...missing],
    available: existing.length > 0,
  };
}

/**
 * Resolusi daftar screenshot saat build. Ekstensi yang ditemukan di `public/`
 * diletakkan paling depan, sisanya tetap menjadi fallback di sisi klien.
 */
export function getScreenshots(): Screenshot[] {
  return slots.map(resolveSlot);
}
