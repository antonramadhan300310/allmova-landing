import fs from "node:fs";
import path from "node:path";

export type Screenshot = {
  src: string;
  title: string;
  caption: string;
};

export const screenshots: Screenshot[] = [
  {
    src: "/screenshots/1-record.png",
    title: "Perekaman GPS & Peta Bersih",
    caption:
      "Layar rekam tanpa distraksi: jarak, durasi, kecepatan, dan elevasi langsung terbaca.",
  },
  {
    src: "/screenshots/2-routes-hike.png",
    title: "Perencanaan Rute & Jalur Hike",
    caption:
      "Susun rute multi-olahraga, ikuti jalur setapak pendakian, dan lihat estimasi Naismith.",
  },
  {
    src: "/screenshots/3-poster-3d.png",
    title: "Poster Peta 3D ALLMOVA",
    caption:
      "Ekspor kartu rute 3D siap unggah dengan tipografi statistik yang rapi.",
  },
  {
    src: "/screenshots/4-stiker-foto.png",
    title: "Stiker Transparan di Atas Foto",
    caption:
      "Tempel statistik transparan di atas foto galeri dengan kontrol geser dan zoom.",
  },
  {
    src: "/screenshots/5-profil-ftp.png",
    title: "Profil Atlet, Kalibrasi FTP & Zona Daya",
    caption:
      "Kalibrasi FTP, pantau zona daya Z1–Z6, dan lacak perkembangan performa.",
  },
];

/**
 * Cek keberadaan file di `public/` saat build agar bingkai screenshot tidak
 * memicu request 404 (dan gambar rusak) ketika pemilik belum mengunggah PNG.
 */
export function isScreenshotAvailable(src: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", src));
  } catch {
    return false;
  }
}

export function getScreenshotAvailability(): Record<string, boolean> {
  return Object.fromEntries(
    screenshots.map((item) => [item.src, isScreenshotAvailable(item.src)]),
  );
}
