import { ArrowRight, MoveHorizontal } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import type { Screenshot } from "@/lib/screenshots";

export function Screenshots({ screenshots }: { screenshots: Screenshot[] }) {
  return (
    <section
      id="screenshots"
      className="relative scroll-mt-24 overflow-hidden border-y border-hairline bg-[#0A0E0F] py-20 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(185,245,30,0.08),transparent_70%)] blur-2xl"
      />
      <div className="container-page relative">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Tampilan Aplikasi</p>
            <h2 className="mt-3 text-[1.85rem] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[2.35rem]">
              Lima layar inti,
              <span className="text-lime"> satu alur kerja</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Dari mulai merekam hingga mengekspor poster 3D — semuanya dalam
              genggaman.
            </p>
          </div>
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold text-white/35 md:hidden">
            <MoveHorizontal className="h-3.5 w-3.5 text-lime" strokeWidth={2.2} />
            Geser untuk melihat semua layar
          </p>
        </div>

        <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5 lg:gap-5">
          {screenshots.map((shot, index) => (
            <figure
              key={shot.base}
              className="group w-[240px] shrink-0 snap-center sm:w-auto"
            >
              <PhoneFrame
                src={shot.base}
                sources={shot.sources}
                alt={`Screenshot ALLMOVA — ${shot.title}`}
                available={shot.available}
                className="transition-transform duration-300 group-hover:-translate-y-1.5"
              />
              <figcaption className="mt-4">
                <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-lime/60">
                  <span>0{index + 1}</span>
                  <ArrowRight className="h-2.5 w-2.5" strokeWidth={3} />
                </p>
                <p className="mt-1.5 text-[13px] font-bold leading-snug text-white/85">
                  {shot.title}
                </p>
                <p className="mt-1 hidden text-[11.5px] leading-relaxed text-white/35 lg:block">
                  {shot.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
