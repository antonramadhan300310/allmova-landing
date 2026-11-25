"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  Check,
  ChevronDown,
  Infinity as InfinityIcon,
  Loader2,
  RotateCcw,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { inputClass, labelClass } from "@/components/admin/styles";
import type { ToastKind } from "@/components/admin/Toast";
import {
  addDaysToExpiry,
  formatExpiryDetail,
  fromDateTimeLocalValue,
  getUserStatus,
  toDateTimeLocalValue,
  type AdminUser,
  type SubscriptionPatch,
  type SubscriptionTier,
} from "@/lib/admin";

type ManageUserModalProps = {
  user: AdminUser;
  onClose: () => void;
  onSave: (userId: string, patch: SubscriptionPatch) => Promise<string | null>;
  onResetDevice: (userId: string) => Promise<string | null>;
  notify: (kind: ToastKind, message: string) => void;
};

type BusyState = null | "quick" | "save" | "reset";

const tierOptions: { value: SubscriptionTier; label: string }[] = [
  { value: "pro", label: "Pro" },
  { value: "trial", label: "Trial" },
  { value: "free", label: "Free" },
];

const quickActions = [
  { days: 30, label: "+30 Hari Pro", hint: "Perpanjang 1 bulan" },
  { days: 90, label: "+3 Bulan Pro", hint: "Perpanjang 90 hari" },
  { days: 365, label: "+1 Tahun Pro", hint: "Perpanjang 365 hari" },
];

export function ManageUserModal({
  user,
  onClose,
  onSave,
  onResetDevice,
  notify,
}: ManageUserModalProps) {
  const [tier, setTier] = useState<SubscriptionTier>(user.tier);
  const [expiryLocal, setExpiryLocal] = useState(
    toDateTimeLocalValue(user.proExpiresAt),
  );
  const [isOwner, setIsOwner] = useState(user.isOwner);
  const [busy, setBusy] = useState<BusyState>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const isBusy = busy !== null;
  const draftUser: AdminUser = {
    ...user,
    tier,
    proExpiresAt: fromDateTimeLocalValue(expiryLocal),
    isOwner,
  };

  useEffect(() => {
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (!confirmReset) return;
    const timer = window.setTimeout(() => setConfirmReset(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmReset]);

  async function commit(
    patch: SubscriptionPatch,
    successMessage: string,
    busyState: BusyState = "save",
  ) {
    setBusy(busyState);
    const error = await onSave(user.id, patch);
    setBusy(null);

    if (error) {
      notify("error", error);
      return;
    }

    setTier(patch.tier);
    setExpiryLocal(toDateTimeLocalValue(patch.proExpiresAt));
    setIsOwner(patch.isOwner);
    notify("success", successMessage);
  }

  function applyQuickAction(days: number) {
    if (isBusy) return;
    const base = fromDateTimeLocalValue(expiryLocal) ?? user.proExpiresAt;
    void commit(
      { tier: "pro", proExpiresAt: addDaysToExpiry(base, days), isOwner },
      `Akses Pro ditambah ${days} hari.`,
      "quick",
    );
  }

  function handleManualSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;
    void commit(
      {
        tier,
        proExpiresAt: fromDateTimeLocalValue(expiryLocal),
        isOwner,
      },
      "Perubahan langganan berhasil disimpan.",
    );
  }

  async function handleResetDevice() {
    if (isBusy) return;
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    setBusy("reset");
    const error = await onResetDevice(user.id);
    setBusy(null);
    setConfirmReset(false);

    if (error) notify("error", error);
    else
      notify(
        "success",
        "Sesi perangkat direset. Pengguna bisa login di perangkat baru.",
      );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Tutup dialog pengaturan pengguna"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-user-title"
        tabIndex={-1}
        className="relative flex max-h-[92dvh] outline-none w-full max-w-[540px] flex-col overflow-hidden rounded-t-[1.75rem] border border-hairline bg-charcoal shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.9)] sm:max-h-[88dvh] sm:rounded-3xl sm:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="eyebrow">Kelola Pengguna</p>
            <h2
              id="manage-user-title"
              className="mt-1.5 truncate text-[15.5px] font-extrabold tracking-[-0.01em] text-white"
            >
              {user.displayName || user.email || "Tanpa Nama"}
            </h2>
            <p className="mt-0.5 truncate text-[11.5px] font-medium text-white/40">
              {user.email || "Email tidak tersedia"}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={getUserStatus(draftUser)} />
              <span className="text-[11px] font-medium text-white/35">
                {formatExpiryDetail(draftUser)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline text-white/45 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <section aria-labelledby="quick-actions-title">
            <h3
              id="quick-actions-title"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45"
            >
              <Zap className="h-3.5 w-3.5 text-lime" strokeWidth={2.4} />
              Aksi Cepat 1-Klik
            </h3>

            {isOwner ? (
              <p className="mt-2.5 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-100/75">
                <InfinityIcon
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-200"
                  strokeWidth={2.4}
                />
                Akun ini Owner dengan akses lifetime. Matikan toggle Owner di
                bawah bila ingin mengatur masa aktif biasa.
              </p>
            ) : (
              <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                {quickActions.map((action) => (
                  <button
                    key={action.days}
                    type="button"
                    onClick={() => applyQuickAction(action.days)}
                    disabled={isBusy}
                    className="group flex flex-col items-start gap-0.5 rounded-xl border border-lime/25 bg-lime/[0.06] px-3 py-2.5 text-left transition-colors hover:border-lime/50 hover:bg-lime/[0.12] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <span className="text-[12px] font-extrabold text-lime">
                      {action.label}
                    </span>
                    <span className="hidden text-[10.5px] font-medium text-lime/50 sm:block">
                      {action.hint}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                void commit(
                  { tier: "free", proExpiresAt: null, isOwner: false },
                  "Akses pengguna diatur ke Free / Expired.",
                  "quick",
                )
              }
              disabled={isBusy || isOwner}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-3 text-[12px] font-bold text-red-200/90 transition-colors hover:border-red-400/45 hover:bg-red-400/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Zap className="h-3.5 w-3.5" strokeWidth={2.4} />
              Set Expired / Free
            </button>
          </section>

          <form
            id="manual-subscription-form"
            onSubmit={handleManualSave}
            className="mt-5 border-t border-hairline pt-4"
          >
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
              <CalendarClock className="h-3.5 w-3.5 text-lime" strokeWidth={2.4} />
              Pengaturan Manual
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="user-tier" className={labelClass}>
                  Tier Langganan
                </label>
                <div className="relative">
                  <select
                    id="user-tier"
                    value={tier}
                    onChange={(event) =>
                      setTier(event.target.value as SubscriptionTier)
                    }
                    disabled={isBusy || isOwner}
                    className={`${inputClass} appearance-none pr-9 [&>option]:bg-charcoal [&>option]:text-white`}
                  >
                    {tierOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
                    strokeWidth={2.4}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user-expiry" className={labelClass}>
                  Tanggal Kadaluarsa
                </label>
                <input
                  id="user-expiry"
                  type="datetime-local"
                  value={expiryLocal}
                  onChange={(event) => setExpiryLocal(event.target.value)}
                  disabled={isBusy || isOwner}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-hairline bg-white/[0.02] px-3.5 py-3">
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-white">
                  Owner / Lifetime
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">
                  Akses penuh tanpa masa kadaluarsa.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isOwner}
                aria-label="Tandai sebagai Owner lifetime"
                onClick={() => setIsOwner((value) => !value)}
                disabled={isBusy}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  isOwner
                    ? "border-lime/60 bg-lime/80"
                    : "border-white/15 bg-white/[0.08]"
                }`}
              >
                <span
                  className={`absolute h-4 w-4 rounded-full bg-charcoal transition-transform ${
                    isOwner ? "translate-x-[26px]" : "translate-x-[4px]"
                  }`}
                />
              </button>
            </div>

            <p className="mt-2.5 text-[11px] leading-relaxed text-white/30">
              Perubahan manual dicatat dengan sumber{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10.5px] text-white/50">
                manual_admin
              </code>
              . Kosongkan tanggal untuk akses Pro tanpa batas waktu.
            </p>
          </form>

          <section className="mt-5 border-t border-hairline pt-4">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
              <Smartphone className="h-3.5 w-3.5 text-lime" strokeWidth={2.4} />
              Sesi Perangkat
            </h3>

            <div className="mt-2.5 flex flex-col gap-2.5 rounded-xl border border-hairline bg-white/[0.02] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white/80">
                  {user.activeDeviceId ? "Perangkat aktif terikat" : "Tidak ada sesi aktif"}
                </p>
                <p
                  className="mt-0.5 truncate font-mono text-[10.5px] text-white/35"
                  title={user.activeDeviceId ?? undefined}
                >
                  {user.activeDeviceId ?? "active_device_id kosong"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDevice}
                disabled={isBusy}
                className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3.5 text-[11.5px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  confirmReset
                    ? "border-red-400/50 bg-red-400/15 text-red-200"
                    : "border-white/[0.12] bg-white/[0.02] text-white/70 hover:border-white/25 hover:text-white"
                }`}
              >
                {busy === "reset" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.4} />
                ) : confirmReset ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.4} />
                )}
                {confirmReset ? "Klik untuk konfirmasi" : "Reset Sesi Perangkat"}
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/30">
              Gunakan bila pengguna terkendala single-device login dan tidak bisa
              masuk dari perangkat baru.
            </p>
          </section>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-hairline bg-charcoal px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="btn-ghost h-11 px-4 text-[12.5px] disabled:opacity-45"
          >
            Tutup
          </button>
          <button
            type="submit"
            form="manual-subscription-form"
            disabled={isBusy}
            className="btn-lime h-11 flex-1 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:shadow-none"
          >
            {busy === "save" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
                Menyimpan…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={2.4} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
