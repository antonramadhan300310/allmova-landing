import Link from "next/link";

type LogoProps = {
  className?: string;
  /** Tampilkan wordmark ΛLLMOVA di samping ikon. */
  withWordmark?: boolean;
  size?: "sm" | "md";
  /** Tujuan tautan logo. Halaman di luar landing page memakai "/". */
  href?: string;
};

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 34 30"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#B9F51E">
        <path d="M0.5 30 L11.5 0 H17.5 L6.5 30 Z" />
        <path d="M9.5 30 L20.5 0 H25.5 L14.5 30 Z" />
        <path d="M18 30 L29 0 H34 L23 30 Z" />
      </g>
    </svg>
  );
}

export function Logo({
  className = "",
  withWordmark = true,
  size = "md",
  href = "#top",
}: LogoProps) {
  const markSize = size === "sm" ? "h-5 w-6" : "h-6 w-7";
  const textSize = size === "sm" ? "text-base" : "text-lg";

  return (
    <Link
      href={href}
      aria-label="ALLMOVA — kembali ke beranda"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <LogoMark className={`${markSize} shrink-0`} />
      {withWordmark && (
        <span
          className={`${textSize} font-extrabold tracking-[0.14em] text-white transition-colors group-hover:text-white`}
        >
          ΛLLMOVA
        </span>
      )}
    </Link>
  );
}
