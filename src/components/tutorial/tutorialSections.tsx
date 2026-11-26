import type { LucideIcon } from "lucide-react";
import {
  BatteryCharging,
  Crown,
  FileDown,
  Gauge,
  Info,
  Lightbulb,
  Navigation,
  RefreshCw,
  Satellite,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export type TutorialSection = {
  id: string;
  number: string;
  /** Label pendek untuk chip navigasi cepat. */
  chip: string;
  title: string;
  teaser: string;
  icon: LucideIcon;
  content: React.ReactNode;
};

/** Label UI aplikasi (tab, tombol, menu) di dalam teks panduan. */
function Ui({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-white/90">{children}</strong>;
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-lime/30 bg-lime/[0.08] text-[11px] font-extrabold text-lime"
      >
        {n}
      </span>
      <p className="min-w-0 text-[13.5px] leading-relaxed text-white/65">
        {children}
      </p>
    </li>
  );
}

function Callout({
  icon: Icon,
  title,
  tone = "lime",
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone?: "lime" | "neutral";
  children: React.ReactNode;
}) {
  const isLime = tone === "lime";

  return (
    <div
      className={`mt-4 rounded-2xl border p-4 ${
        isLime
          ? "border-lime/25 bg-lime/[0.06]"
          : "border-hairline bg-charcoal/40"
      }`}
    >
      <p
        className={`flex items-start gap-2 text-[12px] font-bold uppercase tracking-[0.1em] ${
          isLime ? "text-lime/90" : "text-white/70"
        }`}
      >
        <Icon
          className={`mt-px h-4 w-4 shrink-0 ${
            isLime ? "text-lime" : "text-white/45"
          }`}
          strokeWidth={2.3}
        />
        {title}
      </p>
      <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-white/60">
        {children}
      </div>
    </div>
  );
}

const zones = [
  {
    code: "Z1",
    name: "Active Recovery",
    range: "< 55% FTP",
    note: "Pemanasan, pendinginan, dan hari pemulihan ringan.",
  },
  {
    code: "Z2",
    name: "Endurance",
    range: "56–75% FTP",
    note: "Latihan dasar untuk membangun daya tahan dan efisiensi pembakaran lemak.",
  },
  {
    code: "Z3",
    name: "Tempo",
    range: "76–90% FTP",
    note: "Tempo stabil yang bisa dijaga dalam durasi menengah.",
  },
  {
    code: "Z4",
    name: "Threshold",
    range: "91–105% FTP",
    note: "Ambang laktat; terasa berat namun masih bisa dipertahankan.",
  },
  {
    code: "Z5",
    name: "VO2 Max",
    range: "> 106% FTP",
    note: "Interval pendek dan intens untuk menaikkan kapasitas aerobik.",
  },
];

export const tutorialSections: TutorialSection[] = [
  {
    id: "rekam-gps",
    number: "1",
    chip: "Rekam & GPS",
    title: "Cara Merekam Aktivitas & Tips GPS Stabil",
    teaser:
      "Alur lengkap dari menekan Mulai hingga tersimpan di Activities, plus cara menjaga GPS tetap merekam.",
    icon: Satellite,
    content: (
      <>
        <ol className="flex flex-col gap-3">
          <Step n="1">
            Buka tab <Ui>Record</Ui> di bar navigasi bawah aplikasi.
          </Step>
          <Step n="2">
            Pilih jenis aktivitas: <Ui>Cycling</Ui>, <Ui>Run</Ui>,{" "}
            <Ui>Walking</Ui>, atau <Ui>Hike</Ui>.
          </Step>
          <Step n="3">
            Pastikan izin lokasi ALLMOVA aktif: <Ui>Setelan</Ui> →{" "}
            <Ui>Aplikasi</Ui> → <Ui>ALLMOVA</Ui> → <Ui>Izin</Ui> →{" "}
            <Ui>Lokasi</Ui>, lalu pilih <Ui>Saat aplikasi digunakan</Ui> atau{" "}
            <Ui>Selalu izinkan</Ui>.
          </Step>
          <Step n="4">
            Tunggu sinyal GPS terkunci. Berdiri di area terbuka selama 10–30
            detik sampai penanda posisi berhenti berkedip dan indikator sinyal
            penuh — tanda koordinat awal sudah akurat.
          </Step>
          <Step n="5">
            Ketuk <Ui>Mulai</Ui>. Jarak, durasi, kecepatan, dan elevasi mulai
            tercatat.
          </Step>
          <Step n="6">
            Saat beristirahat, ketuk <Ui>Pause</Ui>, lalu <Ui>Lanjutkan</Ui>{" "}
            ketika kembali bergerak. Durasi dan kecepatan rata-rata pun tetap
            mencerminkan waktu bergerak Anda.
          </Step>
          <Step n="7">
            Setelah selesai, ketuk <Ui>Selesai &amp; Simpan</Ui>. Aktivitas
            langsung masuk ke tab <Ui>Activities</Ui> dan tersinkron ke Cloud
            ALLMOVA.
          </Step>
        </ol>

        <Callout
          icon={BatteryCharging}
          title="Tips agar GPS tidak terputus saat layar dikunci"
        >
          <p>
            Android sering membatasi aplikasi di latar belakang. Lakukan
            penyetelan berikut sekali saja, lalu GPS akan terus merekam walau
            layar mati atau HP dikantongi:
          </p>
          <ul className="space-y-1.5">
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                <Ui>Setelan</Ui> → <Ui>Aplikasi</Ui> → <Ui>ALLMOVA</Ui> →{" "}
                <Ui>Baterai</Ui> → pilih <Ui>Tidak Dibatasi / Unrestricted</Ui>.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Matikan <Ui>Battery Saver</Ui> dan mode hemat daya selama
                merekam aktivitas.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                <Ui>Xiaomi / Redmi</Ui>: aktifkan <Ui>Autostart</Ui> dan pilih{" "}
                <Ui>Tidak ada pembatasan</Ui> pada penghemat baterai.{" "}
                <Ui>Samsung</Ui>: buka <Ui>Baterai</Ui> →{" "}
                <Ui>Aplikasi yang ditidurkan</Ui>, lalu keluarkan ALLMOVA.{" "}
                <Ui>Oppo / Vivo / Realme</Ui>: izinkan <Ui>Autostart</Ui> dan
                aktivitas latar belakang.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Biarkan notifikasi <Ui>ALLMOVA sedang merekam</Ui> tetap tampil.
                Notifikasi tersebut adalah tanda layanan GPS berjalan normal.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Jangan menggeser ALLMOVA keluar dari daftar aplikasi terkini
                saat merekam. Akhiri sesi lewat tombol{" "}
                <Ui>Selesai &amp; Simpan</Ui>.
              </span>
            </li>
          </ul>
          <p className="text-[12.5px] text-white/45">
            Jika Anda berada di dalam gedung atau memakai pelindung bodi tebal,
            keluar ke area terbuka sebentar agar sinyal kembali terkunci.
          </p>
        </Callout>
      </>
    ),
  },
  {
    id: "rute-3d",
    number: "2",
    chip: "Rute & 3D",
    title: "Eksplorasi Rute & 3D Flyover",
    teaser:
      "Pilih rekomendasi rute lokal, putar flyover 3D, lalu gunakan Ikuti Rute sebagai panduan navigasi.",
    icon: Navigation,
    content: (
      <>
        <ol className="flex flex-col gap-3">
          <Step n="1">
            Buka tab <Ui>Routes</Ui> untuk melihat rute yang tersedia beserta
            jarak, elevasi, dan estimasi waktu tempuhnya.
          </Step>
          <Step n="2">
            Pilih salah satu <Ui>Rekomendasi Rute</Ui> lokal yang dikurasi tim
            ALLMOVA, lalu ketuk kartunya untuk membuka detail rute.
          </Step>
          <Step n="3">
            Ketuk tombol putar pada panel <Ui>3D Flyover</Ui> untuk memutar
            visualisasi rute secara sinematik. Jalur, kontur elevasi, dan
            tanjakan terlihat jelas sebelum Anda berangkat.
          </Step>
          <Step n="4">
            Ketuk <Ui>Ikuti Rute</Ui> untuk memakai rute tersebut sebagai
            panduan navigasi. Posisi Anda tampil di peta dan jalur rute ditandai
            garis hijau neon — ikuti garis itu sampai tujuan.
          </Step>
        </ol>

        <Callout icon={Lightbulb} title="Agar navigasi tetap lancar">
          <ul className="space-y-1.5">
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Pastikan GPS aktif dan baterai cukup; navigasi membutuhkan
                pembaruan posisi terus-menerus.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Mulai navigasi dari area terbuka agar arah dan posisi awal lebih
                akurat.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Tetap berada di dalam aplikasi selama navigasi berlangsung,
                kecuali ALLMOVA sudah diatur tanpa pembatasan baterai.
              </span>
            </li>
          </ul>
        </Callout>
      </>
    ),
  },
  {
    id: "gpx",
    number: "3",
    chip: "Import/Export GPX",
    title: "Import & Export File GPX",
    teaser:
      "Masukkan rute .gpx dari perangkat lain, atau ekspor aktivitas ke folder Download untuk dibagikan.",
    icon: FileDown,
    content: (
      <>
        <ol className="flex flex-col gap-3">
          <Step n="1">
            <Ui>Import</Ui>: buka tab <Ui>Routes</Ui>, ketuk tombol{" "}
            <Ui>Import GPX</Ui>, lalu pilih file <Ui>.gpx</Ui> dari folder{" "}
            <Ui>Download / Unduhan</Ui> atau penyimpanan HP Anda.
          </Step>
          <Step n="2">
            Tunggu proses unggah selesai. Rute baru muncul di daftar rute dan
            siap diputar lewat <Ui>3D Flyover</Ui> atau diikuti dengan{" "}
            <Ui>Ikuti Rute</Ui>.
          </Step>
          <Step n="3">
            <Ui>Export aktivitas</Ui>: buka tab <Ui>Activities</Ui>, pilih
            aktivitas yang ingin dibagikan, lalu ketuk <Ui>Ekspor GPX</Ui> pada
            menu aktivitas.
          </Step>
          <Step n="4">
            <Ui>Export rute</Ui>: buka detail rute di tab <Ui>Routes</Ui>, buka
            menu rute, lalu pilih <Ui>Ekspor GPX</Ui>.
          </Step>
          <Step n="5">
            File tersimpan otomatis di folder <Ui>Download / Unduhan</Ui> HP.
            Dari sana Anda bisa mengunggahnya ke Strava, Garmin Connect, atau
            membagikannya ke teman lewat WhatsApp dan email.
          </Step>
        </ol>

        <Callout icon={Info} title="Tentang format GPX" tone="neutral">
          <p>
            File GPX berisi titik koordinat, waktu, dan elevasi perjalanan,
            sehingga kompatibel dengan Strava, Komoot, Garmin, dan aplikasi peta
            lainnya. Gunakan aplikasi <Ui>Files / Pengelola Berkas</Ui> di HP
            untuk memastikan file benar-benar tersimpan di folder{" "}
            <Ui>Download</Ui> sebelum diunggah.
          </p>
        </Callout>
      </>
    ),
  },
  {
    id: "profil-ftp",
    number: "4",
    chip: "Profil & FTP",
    title: "Kalibrasi Profil Atlet & Zona Daya (FTP)",
    teaser:
      "Isi berat badan, berat sepeda, dan FTP agar estimasi daya serta zona latihan Z1–Z5 lebih akurat.",
    icon: Gauge,
    content: (
      <>
        <ol className="flex flex-col gap-3">
          <Step n="1">
            Buka tab <Ui>Profil</Ui>, lalu pilih <Ui>Profil Atlet</Ui>.
          </Step>
          <Step n="2">
            Isi <Ui>berat badan</Ui> (kg). Angka ini dipakai untuk estimasi
            kalori, daya, dan kecepatan relatif.
          </Step>
          <Step n="3">
            Pilih <Ui>jenis sepeda</Ui> (misalnya Road, MTB, Gravel, atau
            Folding) dan isi <Ui>berat sepeda</Ui> (kg) agar perhitungan beban
            gulir lebih presisi.
          </Step>
          <Step n="4">
            Isi nilai <Ui>FTP</Ui> (Functional Threshold Power), yaitu daya
            rata-rata tertinggi yang mampu Anda pertahankan sekitar satu jam.
            Jika punya power meter, uji 20 menit lalu kalikan hasilnya dengan
            0,95. Jika belum punya, biarkan kosong dan ALLMOVA memakai estimasi
            berbasis berat badan.
          </Step>
          <Step n="5">
            Ketuk <Ui>Simpan</Ui>. Estimasi daya dan pembagian zona latihan
            dihitung ulang secara otomatis.
          </Step>
        </ol>

        <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white/45">
          Zona Daya Berbasis FTP
        </p>
        <ul className="mt-2 divide-y divide-white/[0.06] rounded-2xl border border-hairline bg-charcoal/40">
          {zones.map((zone) => (
            <li
              key={zone.code}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 py-2.5"
            >
              <span className="text-[11px] font-extrabold tracking-wide text-lime">
                {zone.code}
              </span>
              <span className="text-[12.5px] font-semibold text-white/85">
                {zone.name}
              </span>
              <span className="ml-auto rounded-full border border-hairline px-2 py-0.5 font-mono text-[10.5px] text-white/50">
                {zone.range}
              </span>
              <span className="w-full text-[12px] leading-relaxed text-white/40">
                {zone.note}
              </span>
            </li>
          ))}
        </ul>

        <Callout icon={Lightbulb} title="Kapan perlu diperbarui">
          <p>
            Perbarui berat badan setiap ada perubahan signifikan dan ulangi uji
            FTP setiap 4–8 minggu. Zona yang akurat membuat setiap sesi latihan
            berada pada intensitas yang benar.
          </p>
        </Callout>
      </>
    ),
  },
  {
    id: "status-akun",
    number: "5",
    chip: "Status Akun",
    title: "Status Akun: Trial 14 Hari, Free, & PRO",
    teaser:
      "Alur langganan: PRO Trial 14 hari untuk pengguna baru, kembali ke Free, lalu aktifkan PRO lagi.",
    icon: Crown,
    content: (
      <>
        <ol className="flex flex-col gap-3">
          <Step n="1">
            Setiap pengguna baru otomatis mendapatkan{" "}
            <Ui>ALLMOVA PRO Trial selama {siteConfig.trialDays} hari</Ui> sejak
            pendaftaran. Seluruh fitur Pro terbuka penuh tanpa biaya.
          </Step>
          <Step n="2">
            Setelah masa trial berakhir, akun kembali ke status <Ui>FREE</Ui>.
            Riwayat aktivitas dan rute tetap tersimpan aman; fitur dasar masih
            bisa dipakai, sedangkan fitur Pro menjadi terkunci.
          </Step>
          <Step n="3">
            Untuk mengaktifkan kembali PRO, pilih paket langganan{" "}
            <Ui>{siteConfig.pricing.monthly.priceLabel} / bulan</Ui> (atau{" "}
            <Ui>{siteConfig.pricing.yearly.priceLabel} / tahun</Ui>), lalu ikuti
            instruksi aktivasi dari Admin.
          </Step>
          <Step n="4">
            Setelah pembayaran diverifikasi, Admin mengaktifkan PRO pada akun
            Anda. Status dan sisa masa aktif bisa dicek kapan saja di tab{" "}
            <Ui>Profil</Ui> → <Ui>Status Akun</Ui>.
          </Step>
        </ol>

        <Callout icon={Crown} title="Yang Anda dapatkan di PRO">
          <ul className="space-y-1.5">
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Visualisasi <Ui>3D Flyover</Ui> dan poster rute siap unggah ke
                media sosial.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Analitik performa lengkap, zona daya, dan rekor pribadi tanpa
                batas.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
              />
              <span>
                Sinkronisasi penuh ke Cloud ALLMOVA dan akses seluruh rute
                kurasi.
              </span>
            </li>
          </ul>
        </Callout>
      </>
    ),
  },
  {
    id: "update-ota",
    number: "6",
    chip: "Update OTA",
    title: "Cara Update Aplikasi Tanpa Instal Ulang (OTA)",
    teaser:
      "Cukup buka Profil Atlet dan ketuk Cek Pembaruan untuk mendapat fitur terbaru tanpa unduh ulang APK.",
    icon: RefreshCw,
    content: (
      <>
        <ol className="flex flex-col gap-3">
          <Step n="1">
            Buka tab <Ui>Profil</Ui>, lalu pilih <Ui>Profil Atlet</Ui>.
          </Step>
          <Step n="2">
            Ketuk <Ui>Cek Pembaruan</Ui>. ALLMOVA membandingkan versi terpasang
            dengan versi terbaru di server.
          </Step>
          <Step n="3">
            Jika tersedia, ikuti dialog pembaruan: unduh paketnya (ukurannya
            beberapa MB), lalu tunggu sampai aplikasi menerapkan pembaruan dan
            memuat ulang secara otomatis.
          </Step>
          <Step n="4">
            Tidak perlu menghapus atau menginstal ulang APK. Akun, riwayat
            aktivitas, dan pengaturan Anda tetap utuh setelah pembaruan.
          </Step>
        </ol>

        <Callout icon={Info} title="Catatan pembaruan" tone="neutral">
          <p>
            OTA mengirimkan fitur baru dan perbaikan bug tanpa instal ulang.
            Jika ada pembaruan yang menyentuh komponen inti Android, Admin akan
            mengumumkannya agar Anda mengunduh APK versi terbaru. Versi aplikasi
            yang terpasang dapat dilihat di bagian bawah halaman{" "}
            <Ui>Profil Atlet</Ui>.
          </p>
        </Callout>
      </>
    ),
  },
];
