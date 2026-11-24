"use client";

import { useState } from "react";
import { ImageOff, Smartphone } from "lucide-react";

type PhoneFrameProps = {
  src: string;
  alt: string;
  /** True bila file PNG sudah tersedia di `public/`. */
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
        Upload: public{src}
      </p>
      <p className="relative max-w-[85%] text-[9.5px] leading-relaxed text-white/30">
        Bingkai ini otomatis menampilkan gambar setelah file PNG tersedia.
      </p>
    </div>
  );
}

export function PhoneFrame({
  src,
  alt,
  available = true,
  className = "",
  glow = false,
  priority = false,
}: PhoneFrameProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const showImage = available && failedSrc !== src;

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
          {/* notch / dynamic island */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-[18px] w-24 -translate-x-1/2 rounded-full bg-black/85 ring-1 ring-white/10">
            <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#1c2a2e] ring-1 ring-white/10" />
          </div>

          <div className="relative aspect-[9/19] w-full">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                onError={() => setFailedSrc(src)}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <Placeholder src={src} />
            )}
          </div>

          {/* status bar hint */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-white/50">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" strokeWidth={2} />
              <span className="tracking-tight">ALLMOVA</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
