import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getWhatsAppContactUrl, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Kebijakan Privasi — ALLMOVA" },
  description:
    "Kebijakan Privasi ALLMOVA: cara kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi serta rute GPS Anda sesuai UU PDP (UU No. 27 Tahun 2022).",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "article",
    locale: "id_ID",
    url: "/privacy",
    siteName: siteConfig.name,
    title: "Kebijakan Privasi — ALLMOVA",
    description:
      "Transparansi penuh tentang data akun, rute GPS, dan Heatmap pribadi Anda di ALLMOVA sesuai UU PDP.",
  },
};

const UPDATED_AT = "25 November 2026";

const sections = [
  { id: "pendahuluan", number: "1", title: "Pendahuluan & Pengelola" },
  {
    id: "data-yang-dikumpulkan",
    number: "2",
    title: "Data yang Kami Kumpulkan",
  },
  { id: "penggunaan-data", number: "3", title: "Penggunaan Data" },
  {
    id: "penyimpanan",
    number: "4",
    title: "Penyimpanan, Enkripsi, & Isolasi Data",
  },
  {
    id: "hak-pengguna",
    number: "5",
    title: "Hak Pengguna & Penghapusan Akun",
  },
  { id: "kontak", number: "6", title: "Kontak Pengelola" },
];

const accountData = [
  "Alamat email dan nama tampilan yang Anda daftarkan.",
  "Pengenal autentikasi (ID pengguna) yang dibuat oleh layanan autentikasi kami.",
  "Jika Anda memakai Login dengan Google, kami menerima email, nama, dan foto profil publik dari akun Google Anda. Kata sandi Google Anda tidak pernah kami lihat atau simpan.",
];

const activityData = [
  "Koordinat GPS beserta jejak rute perjalanan yang Anda rekam.",
  "Jarak, durasi, kecepatan (pace), elevasi, dan statistik turunan lainnya.",
  "Jenis olahraga (Cycling, Run, Walking, Hike) serta preferensi profil atlet seperti nama aktivitas, target, dan pengaturan tampilan.",
];

const deviceData = [
  "Pengenal sesi (session token) untuk menjaga keamanan single-device login dan mengakhiri sesi lama secara otomatis.",
  "Antrean aktivitas offline di penyimpanan lokal perangkat, agar rekaman tetap aman saat sinyal terputus lalu tersinkron ketika kembali online.",
  "Informasi teknis dasar seperti model perangkat, versi sistem operasi, dan versi aplikasi untuk keperluan diagnosis masalah.",
];

const purposes = [
  "Menyediakan fitur pelacakan aktivitas GPS secara akurat dan berkelanjutan.",
  "Menampilkan riwayat latihan, statistik performa, serta Rekor Pribadi (PR) Anda.",
  "Membangun Heatmap pribadi yang merangkum area aktivitas Anda sendiri.",
  "Menghasilkan ekspor visualisasi rute 3D, poster peta, dan video flyover yang Anda minta.",
  "Menjaga keamanan akun melalui verifikasi sesi single-device login dan pemulihan data offline.",
  "Menanggapi pertanyaan bantuan, permintaan privasi, atau laporan masalah teknis dari Anda.",
];

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 rounded-2xl border border-hairline bg-surface/60 p-5 sm:p-7"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-lime/30 bg-lime/[0.08] text-[12px] font-extrabold text-lime"
        >
          {number}
        </span>
        <h2
          id={`${id}-title`}
          className="text-[17px] font-bold leading-snug tracking-[-0.01em] text-white sm:text-lg"
        >
          {title}
        </h2>
      </div>
      <div className="mt-3.5 space-y-3.5 text-[13.5px] leading-relaxed text-white/60 sm:text-sm sm:leading-[1.75]">
        {children}
      </div>
    </section>
  );
}

function DataList({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof UserRound;
  label: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-hairline bg-charcoal/40 p-4">
      <p className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.12em] text-white/75">
        <Icon className="h-4 w-4 shrink-0 text-lime" strokeWidth={2.2} />
        {label}
      </p>
      <ul className="mt-2.5 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PrivacyPage() {
  const mailto = `mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(
    "Permintaan Privasi Data — ALLMOVA",
  )}`;

  return (
    <div className="relative flex min-h-screen flex-col bg-charcoal">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-faint bg-[size:64px_64px] opacity-[0.5] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_72%)]" />
        <div className="absolute -top-40 left-1/2 h-[440px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(185,245,30,0.14),transparent_65%)] blur-3xl" />
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
        <div className="container-page pb-16 pt-10 sm:pt-14">
          <div className="max-w-3xl">
            <span className="eyebrow">Legal · Pelindungan Data Pribadi</span>
            <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.6rem]">
              Kebijakan <span className="text-lime">Privasi</span>
            </h1>
            <p className="mt-4 text-[14.5px] leading-relaxed text-white/60 sm:text-[15px]">
              Kami merancang ALLMOVA agar jejak rute dan performa olahraga Anda
              tetap menjadi milik Anda sepenuhnya. Halaman ini menjelaskan data
              apa yang kami kelola, untuk apa, dan bagaimana Anda dapat
              mengendalikannya.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/[0.07] px-3 py-1.5 text-[11px] font-semibold text-lime/90">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
                Sesuai UU PDP No. 27 Tahun 2022
              </span>
              <span className="inline-flex items-center rounded-full border border-hairline px-3 py-1.5 text-[11px] font-semibold text-white/40">
                Terakhir diperbarui: {UPDATED_AT}
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,210px)_minmax(0,1fr)] lg:gap-10">
            <nav aria-label="Daftar isi" className="hidden lg:block">
              <div className="sticky top-24">
                <p className="eyebrow">Daftar Isi</p>
                <ol className="mt-3.5 flex flex-col gap-1 border-l border-hairline pl-4">
                  {sections.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block py-1.5 text-[12.5px] font-medium leading-snug text-white/45 transition-colors hover:text-lime"
                      >
                        {item.number}. {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="flex min-w-0 flex-col gap-4">
              <Section
                id="pendahuluan"
                number="1"
                title="Pendahuluan & Pengelola"
              >
                <p>
                  Kebijakan Privasi ini berlaku untuk aplikasi mobile{" "}
                  <strong className="font-semibold text-white/85">ALLMOVA</strong>{" "}
                  (Android) beserta situs resminya. Dokumen ini disusun untuk
                  memenuhi kewajiban kami sebagai pengendali data pribadi
                  berdasarkan{" "}
                  <strong className="font-semibold text-white/85">
                    Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data
                    Pribadi (UU PDP)
                  </strong>
                  .
                </p>
                <p>
                  Pengelola aplikasi dan situs ALLMOVA adalah tim pengembang
                  ALLMOVA (&ldquo;kami&rdquo;). Dengan mengunduh, mendaftar, atau
                  menggunakan layanan ALLMOVA, Anda menyatakan telah membaca dan
                  memahami kebijakan ini. Bila Anda tidak menyetujui salah satu
                  ketentuannya, mohon berhenti menggunakan layanan.
                </p>
              </Section>

              <Section
                id="data-yang-dikumpulkan"
                number="2"
                title="Data yang Kami Kumpulkan"
              >
                <p>
                  Kami hanya mengumpulkan data yang benar-benar diperlukan untuk
                  menjalankan fitur ALLMOVA. Tidak ada data yang dikumpulkan
                  secara diam-diam di luar penjelasan berikut.
                </p>
                <div className="grid gap-3">
                  <DataList
                    icon={UserRound}
                    label="Data Akun"
                    items={accountData}
                  />
                  <DataList
                    icon={MapPin}
                    label="Data Lokasi & Aktivitas Olahraga"
                    items={activityData}
                  />
                  <DataList
                    icon={Smartphone}
                    label="Data Perangkat & Sesi"
                    items={deviceData}
                  />
                </div>
                <p className="rounded-xl border border-lime/20 bg-lime/[0.05] p-4 text-[13px] leading-relaxed text-white/65">
                  <strong className="font-semibold text-lime/90">
                    Lokasi GPS hanya direkam secara aktif saat Anda menekan tombol
                    mulai pada perekaman aktivitas
                  </strong>{" "}
                  dan berhenti ketika Anda mengakhiri sesi tersebut. ALLMOVA tidak
                  melacak lokasi Anda di latar belakang di luar sesi perekaman.
                </p>
              </Section>

              <Section id="penggunaan-data" number="3" title="Penggunaan Data">
                <p>Data yang kami kumpulkan digunakan secara terbatas untuk:</p>
                <ul className="space-y-2">
                  {purposes.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime/70"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex gap-3 rounded-xl border border-lime/25 bg-lime/[0.07] p-4 text-[13px] font-semibold leading-relaxed text-white/85">
                  <ShieldCheck
                    className="h-[18px] w-[18px] shrink-0 text-lime"
                    strokeWidth={2.4}
                  />
                  <span>
                    ALLMOVA tidak pernah menjual, menyewakan, atau memperdagangkan
                    data pribadi maupun rute GPS Anda kepada pihak ketiga, broker
                    data, atau pengiklan mana pun.
                  </span>
                </p>
              </Section>

              <Section
                id="penyimpanan"
                number="4"
                title="Penyimpanan, Enkripsi, & Isolasi Data"
              >
                <p>
                  Seluruh data akun dan aktivitas disimpan pada infrastruktur
                  cloud terenkripsi yang kami kelola melalui{" "}
                  <strong className="font-semibold text-white/85">Supabase</strong>
                  . Data dienkripsi saat transit menggunakan{" "}
                  <strong className="font-semibold text-white/85">
                    HTTPS/TLS
                  </strong>{" "}
                  dan disimpan dalam penyimpanan terenkripsi di sisi server.
                </p>
                <p>
                  Akses ke database dilindungi oleh{" "}
                  <strong className="font-semibold text-white/85">
                    Row Level Security (RLS)
                  </strong>
                  , yaitu isolasi akses ketat pada tingkat baris data. Dengan
                  mekanisme ini, jejak rute, riwayat aktivitas, dan Heatmap hanya
                  dapat dibaca oleh pemilik akun yang bersangkutan — pengguna lain
                  tidak dapat mengakses, mencari, atau menebak data Anda.
                </p>
                <p>
                  Data disimpan selama akun Anda aktif. Ketika Anda menghapus akun,
                  data pada sistem produksi dihapus secara permanen dan salinan
                  cadangan ikut terhapus dalam siklus rotasi berkala. Data anonim
                  yang tidak lagi dapat dikaitkan dengan identitas Anda dapat
                  disimpan lebih lama untuk keperluan statistik agregat.
                </p>
                <p className="flex gap-3 rounded-xl border border-hairline bg-charcoal/40 p-4 text-[13px] leading-relaxed">
                  <Lock
                    className="mt-0.5 h-4 w-4 shrink-0 text-lime"
                    strokeWidth={2.2}
                  />
                  <span>
                    Kata sandi tidak pernah disimpan dalam bentuk teks biasa.
                    Autentikasi email dikelola oleh layanan autentikasi Supabase,
                    sedangkan Login dengan Google menggunakan protokol OAuth resmi
                    Google.
                  </span>
                </p>
              </Section>

              <Section
                id="hak-pengguna"
                number="5"
                title="Hak Pengguna & Penghapusan Akun Permanen"
              >
                <p>
                  Sesuai UU PDP, Anda berhak untuk mengakses, memperbarui,
                  memperbaiki, dan menghapus data pribadi Anda, menarik kembali
                  persetujuan yang telah diberikan, serta mengajukan keberatan atas
                  pengolahan data tertentu.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-hairline bg-charcoal/40 p-4">
                    <p className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.12em] text-white/75">
                      <Trash2
                        className="h-4 w-4 shrink-0 text-lime"
                        strokeWidth={2.2}
                      />
                      Lewat Aplikasi
                    </p>
                    <p className="mt-2">
                      Buka menu <em>Pengaturan → Akun</em> lalu pilih{" "}
                      <strong className="font-semibold text-white/85">
                        Hapus Akun
                      </strong>
                      . Akun beserta seluruh riwayat data GPS akan dihapus secara
                      permanen dan tidak dapat dipulihkan.
                    </p>
                  </div>
                  <div className="rounded-xl border border-hairline bg-charcoal/40 p-4">
                    <p className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.12em] text-white/75">
                      <Mail
                        className="h-4 w-4 shrink-0 text-lime"
                        strokeWidth={2.2}
                      />
                      Lewat Email
                    </p>
                    <p className="mt-2">
                      Kirim permintaan dari email terdaftar Anda ke{" "}
                      <a
                        href={mailto}
                        className="break-words font-semibold text-lime underline decoration-lime/40 underline-offset-2 hover:decoration-lime"
                      >
                        {siteConfig.supportEmail}
                      </a>
                      . Kami memverifikasi kepemilikan akun dan menindaklanjuti
                      dalam 3 × 24 jam kerja.
                    </p>
                  </div>
                </div>
                <p className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-4 text-[12.5px] leading-relaxed text-white/55">
                  <strong className="font-semibold text-white/80">Catatan:</strong>{" "}
                  penghapusan akun yang masih memiliki masa langganan ALLMOVA Pro
                  aktif bersifat final dan tidak dapat dikembalikan
                  (non-refundable). Sisa masa aktif tidak dapat dipindahkan ke akun
                  lain.
                </p>
                <p>
                  Bila Anda menilai pengolahan data kami tidak sesuai ketentuan,
                  Anda berhak menyampaikan pengaduan kepada kami terlebih dahulu
                  melalui kontak pada bagian 6, dan/atau kepada lembaga pengawas
                  pelindungan data pribadi yang berwenang di Indonesia.
                </p>
              </Section>

              <Section id="kontak" number="6" title="Kontak Pengelola">
                <p>
                  Pertanyaan, permintaan akses, atau keberatan terkait privasi data
                  Anda dapat disampaikan langsung kepada pengelola ALLMOVA melalui
                  kanal berikut:
                </p>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                  <a
                    href={mailto}
                    className="btn-ghost h-12 min-w-0 px-4 text-[12.5px] sm:text-[13px]"
                  >
                    <Mail
                      className="h-4 w-4 shrink-0 text-lime"
                      strokeWidth={2.2}
                    />
                    <span className="truncate">{siteConfig.supportEmail}</span>
                  </a>
                  <a
                    href={getWhatsAppContactUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-lime h-12 px-4 text-[12.5px] sm:text-[13px]"
                  >
                    <WhatsAppIcon className="h-4 w-4 shrink-0" />
                    Chat Admin via WhatsApp
                  </a>
                </div>
                <p className="flex gap-3 text-[12.5px] leading-relaxed text-white/45">
                  <Database
                    className="mt-0.5 h-4 w-4 shrink-0 text-white/35"
                    strokeWidth={2.2}
                  />
                  <span>
                    Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu
                    untuk menyesuaikan fitur baru atau perubahan regulasi. Versi
                    terbaru selalu tersedia di halaman ini beserta tanggal
                    pembaruannya.
                  </span>
                </p>
              </Section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
