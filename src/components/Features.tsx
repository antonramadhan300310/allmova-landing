import {
  Activity,
  Film,
  Image as ImageIcon,
  Route,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  tag: string;
  title: string;
  body: string;
};

const features: Feature[] = [
  {
    icon: Activity,
    tag: "GPS",
    title: "Pelacakan GPS Latar Belakang",
    body: "Mendukung Cycling, Run, Walking, dan Hike dengan perekaman stabil meski layar terkunci atau minim sinyal.",
  },
  {
    icon: Route,
    tag: "RUTE",
    title: "Perencanaan Rute & Topografi Hike",
    body: "Mesin rute multi-olahraga, jalur setapak pendakian, mode bebas garis lurus (Off-Trail), dan estimasi waktu tanjakan Naismith's Rule.",
  },
  {
    icon: Film,
    tag: "3D",
    title: "3D Flyover & Ekspor Video MP4",
    body: "Ubah rekaman rute menjadi animasi penerbangan peta 3D sinematik beresolusi tinggi untuk dibagikan ke media sosial.",
  },
  {
    icon: ImageIcon,
    tag: "POSTER",
    title: "Poster Peta 3D & Stiker Transparan",
    body: "Ekspor kartu rute 3D atau tempel statistik langsung di atas foto galeri Anda dengan kontrol geser dan zoom.",
  },
];

export function Features() {
  return (
    <section id="fitur" className="relative scroll-mt-24 py-20 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      <div className="container-page">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Fitur Unggulan</p>
            <h2 className="mt-3 text-[1.85rem] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[2.35rem]">
              Empat alasan ALLMOVA jadi
              <span className="text-lime"> pusat data olahraga</span> Anda
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-white/45">
            Dibangun untuk pesepeda, pelari, pejalan, dan pendaki yang ingin
            data akurat sekaligus hasil visual yang layak dibagikan.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {features.map(({ icon: Icon, tag, title, body }, index) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-hairline bg-surface/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime/25 hover:bg-surface lg:p-7"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(185,245,30,0.14),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-hairline bg-charcoal/70 text-lime transition-colors group-hover:border-lime/30 group-hover:bg-lime/10">
                  <Icon className="h-5 w-5" strokeWidth={2.1} />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                  {tag} / 0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-[17px] font-bold tracking-tight text-white lg:text-lg">
                {title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/50">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
