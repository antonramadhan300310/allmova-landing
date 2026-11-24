# ALLMOVA — Landing Page

Landing page resmi aplikasi olahraga **ALLMOVA** (Android APK). Dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, dan `lucide-react`, siap deploy ke Vercel.

## Menjalankan lokal

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build produksi
npx tsc --noEmit
```

## Yang perlu diedit pemilik

Semua konten utama ada di **`src/config/site.ts`**:

| Nilai | Keterangan |
| --- | --- |
| `adminWhatsAppNumber` | Nomor WhatsApp admin (format `62...`, tanpa `+`). Ganti di baris ini. |
| `appVersion` | Versi yang tampil di badge, tombol, dan footer. |
| `apkDownloadUrl` | Path file APK lokal, default `/downloads/ALLMOVA.apk`. |
| `pricing` | Harga Bulanan / Tahunan beserta label diskon. |

Link WhatsApp Pro dibuat otomatis oleh `getWhatsAppProUrl(billingCycle)` dengan pesan sesuai paket yang dipilih pengunjung.

## File APK

Letakkan file APK di `public/downloads/ALLMOVA.apk`. Folder ini sudah disertakan
lewat `public/downloads/.gitkeep`, jadi cukup unggah APK-nya lalu commit. Tombol
unduhan memakai atribut `download="ALLMOVA.apk"` sehingga browser HP langsung
menyimpan file (direct download), bukan membuka tab baru.

## Screenshot aplikasi

Unggah 5 file PNG ke `public/screenshots/`:

1. `1-record.png` — Perekaman GPS & Peta Bersih
2. `2-routes-hike.png` — Perencanaan Rute & Jalur Hike
3. `3-poster-3d.png` — Poster Peta 3D ALLMOVA
4. `4-stiker-foto.png` — Stiker Transparan di Atas Foto
5. `5-profil-ftp.png` — Profil Atlet, Kalibrasi FTP & Zona Daya

Selama file belum ada, bingkai HP otomatis menampilkan placeholder berisi nama file yang harus diunggah (tanpa ikon gambar rusak).

## Deploy

Import repo ke Vercel — tidak perlu environment variable. `images.unoptimized` sudah aktif di `next.config.mjs`.
