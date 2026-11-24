"use client";

import { useEffect, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-hairline bg-charcoal/85 backdrop-blur-xl"
          : "border-transparent bg-charcoal/40 backdrop-blur-md"
      }`}
    >
      <nav
        aria-label="Navigasi utama"
        className="container-page flex h-16 items-center justify-between gap-4"
      >
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={siteConfig.apkDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-lime h-10 px-3.5 text-[12.5px] sm:px-4 sm:text-[13px]"
          >
            <Download className="h-4 w-4" strokeWidth={2.4} />
            <span className="hidden sm:inline">Download APK</span>
            <span className="sm:hidden">APK</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] text-white/80 transition-colors hover:border-white/25 hover:text-white lg:hidden"
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-hairline bg-charcoal/95 px-5 pb-6 pt-3 backdrop-blur-xl lg:hidden"
        >
          <div className="flex flex-col">
            {siteConfig.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-hairline py-3.5 text-sm font-semibold text-white/75 transition-colors hover:text-white"
              >
                {item.label}
                <span className="text-white/20">›</span>
              </a>
            ))}
          </div>
          <a
            href={siteConfig.apkDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn-lime mt-5 h-12 w-full"
          >
            <Download className="h-4 w-4" strokeWidth={2.4} />
            Download APK Android ({siteConfig.appVersion})
          </a>
        </div>
      )}
    </header>
  );
}
