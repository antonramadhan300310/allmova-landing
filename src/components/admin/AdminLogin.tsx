"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { inputClass, labelClass } from "@/components/admin/styles";

type AdminLoginProps = {
  onSubmit: (email: string, password: string) => Promise<string | null>;
  disabled?: boolean;
  notice?: React.ReactNode;
};

export function AdminLogin({
  onSubmit,
  disabled = false,
  notice,
}: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || disabled) return;

    setError(null);
    setSubmitting(true);
    const message = await onSubmit(email.trim(), password);
    setSubmitting(false);
    if (message) setError(message);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-hairline">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Logo href="/" size="sm" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.02] px-3 py-2 text-[12px] font-semibold text-white/70 transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
            Beranda
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:py-16">
        <div className="w-full max-w-[460px]">
          {notice && <div className="mb-4">{notice}</div>}

          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-lime/30 bg-lime/[0.08] text-lime">
              <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2.3} />
            </span>
            <div>
              <p className="text-[15px] font-extrabold tracking-[-0.01em] text-white">
                ALLMOVA Admin
              </p>
              <p className="text-[11.5px] font-medium text-white/40">
                Panel internal pengelola langganan
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-hairline bg-surface/60 p-5 sm:p-6">
            <h1 className="text-[19px] font-extrabold tracking-[-0.02em] text-white">
              Login Admin
            </h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/45">
              Masuk dengan akun Owner ALLMOVA untuk mengelola tier langganan,
              masa aktif Pro, dan sesi perangkat pengguna.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
              <div>
                <label htmlFor="admin-email" className={labelClass}>
                  Email
                </label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
                    strokeWidth={2.2}
                  />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@allmova.app"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
                    strokeWidth={2.2}
                  />
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pl-10 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/70"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={2.2} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={2.2} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.08] px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-red-200"
                >
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    strokeWidth={2.3}
                  />
                  <span>{error}</span>
                </p>
              )}

              {disabled && (
                <p className="rounded-xl border border-hairline bg-white/[0.02] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-white/40">
                  Login dinonaktifkan sampai anon public key Supabase terpasang.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || disabled}
                className="btn-lime mt-1 h-11 w-full text-[13px] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:shadow-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
                    Memverifikasi…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" strokeWidth={2.4} />
                    Masuk sebagai Owner
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-white/30">
            Akses terbatas untuk Owner ALLMOVA. Sesi login disimpan di perangkat
            ini dan dapat diakhiri kapan saja lewat tombol Keluar.
          </p>
        </div>
      </main>
    </div>
  );
}
