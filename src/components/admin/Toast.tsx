"use client";

import { AlertCircle, CheckCircle, X } from "lucide-react";

export type ToastKind = "success" | "error";

export type ToastMessage = {
  id: number;
  kind: ToastKind;
  message: string;
};

const kindStyles: Record<ToastKind, string> = {
  success: "border-lime/30 bg-[#101a08]/95 text-lime-soft",
  error: "border-red-400/35 bg-[#1d0f0f]/95 text-red-200",
};

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[70] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:top-auto sm:bottom-6 sm:w-[360px]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12.5px] font-semibold shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-toast-in ${kindStyles[toast.kind]}`}
        >
          {toast.kind === "success" ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Tutup notifikasi"
            className="-mr-1 -mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-current/60 transition-colors hover:bg-white/10 hover:text-current"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.4} />
          </button>
        </div>
      ))}
    </div>
  );
}
