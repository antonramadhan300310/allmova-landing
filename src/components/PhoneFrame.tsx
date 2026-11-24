"use client";

import { useState } from "react";
import { ImageOff, Smartphone } from "lucide-react";

type PhoneFrameProps = {
  /** Path dasar tanpa ekstensi, mis. `/screenshots/1-record`. */
  src: string;
  /** Kandidat URL berurutan (png -> jpg -> jpeg -> webp). */
  sources?: string[];
  alt: string;
  /** True bila build menemukan minimal satu file screenshot. */
  available?: boolean;
  className?: string;
  /** Tampilkan efek glow lime di belakang perangkat. */
  glow?: boolean;
  priority?: boolean;
};

function Placeholder({ src }: { src: string }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-[radial-gradient(circle_at_50%_15%,rgba(185,245,30,0.14),transparent_60%)] px-4 text-center">
      <div className="absolute inset-0 bg-grid-faint bg-[size:26px_26px] opacity-40" />
      <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-lime/30 bg-lime/10">
        <ImageOff className="h-[18px] w-[18px] text-lime" strokeWidth={1.8} />
      </div>
      <p className="relative text-[10px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-white/40">
        Screenshot belum diunggah
      </p>
      <p className="relative break-all rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-[9px] leading-relaxed text-lime/80">
        Upload: public{src}.png
      </p>
      <p className="relative max-w-[85%] text-[9.5px] leading-relaxed text-white/30">
        Format didukung: PNG, JPG, JPEG, WEBP — bingkai tampil otomatis setelah
        file tersedia.
      </p>
    </div>
  );
}

export function PhoneFrame({
  src,
  sources,
  alt,
  available = true,
  className = "",
  glow = false,
  priority = false,
}: PhoneFrameProps) {
  const candidates = sources && sources.length > 0 ? sources : [src];
  const [failedCount, setFailedCount] = useState(0);

  const currentSrc = available ? candidates[failedCount] : undefined;

  return (
    <div className={`relative ${className}`}>
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-10 -z-10 rounded-[4rem] bg-[radial-gradient(circle_at_50%_40%,rgba(185,245,30,0.22),transparent_65%)] blur-2xl"
        />
      )}
      <div className="relative rounded-[2.4rem] border border-white/[0.12] bg-gradient-to-b from-white/[0.14] to-white/[0.03] p-[3px] shadow-phone">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-black/60 bg-charcoal">
          <div className="relative aspect-[9/19] w-full">
            {currentSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentSrc}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                onError={() => setFailedCount((count) => count + 1)}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <Placeholder src={src} />
            )}
          </div>

          {/* Scrim menutup status bar bawaan screenshot agar header mockup rapi. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.88)_58%,rgba(0,0,0,0)_100%)]"
          />

          {/* Status bar: jam, dynamic island di tengah, label merek di kanan. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3.5 pt-2 text-[10px] font-semibold text-white/75">
            <span className="tabular-nums">9:41</span>
            <span
              aria-hidden="true"
              className="flex h-[18px] w-16 items-center justify-end justify-self-center rounded-full bg-black/90 pr-1.5 ring-1 ring-white/15"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#1c2a2e] ring-1 ring-white/10" />
            </span>
            <span className="flex items-center justify-end justify-self-end gap-1 whitespace-nowrap">
              <Smartphone className="h-3 w-3" strokeWidth={2} />
              <span className="text-[9px] tracking-tight">ALLMOVA</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
