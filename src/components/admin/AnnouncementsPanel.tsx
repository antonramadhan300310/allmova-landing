"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BellRing,
  Check,
  Loader2,
  Megaphone,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { inputClass, labelClass } from "@/components/admin/styles";
import type { ToastKind } from "@/components/admin/Toast";
import { getSupabaseClient } from "@/config/supabase";
import { isSessionExpiredError } from "@/lib/admin";
import {
  describeAnnouncementError,
  formatDateTimeId,
  normalizeAnnouncements,
  type Announcement,
} from "@/lib/announcements";

type AnnouncementsPanelProps = {
  userId: string | null;
  notify: (kind: ToastKind, message: string) => void;
  onAuthFailure: (kind: "unauthorized" | "expired") => void;
};

type FieldErrors = {
  title?: string;
  message?: string;
};

const ANNOUNCEMENT_COLUMNS =
  "id, title, message, is_active, created_by, created_at";

export function AnnouncementsPanel({
  userId,
  notify,
  onAuthFailure,
}: AnnouncementsPanelProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirmTimer = useRef<number | null>(null);

  const loadAnnouncements = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      setListError("Supabase belum dikonfigurasi.");
      return;
    }

    setLoading(true);
    setListError(null);

    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(ANNOUNCEMENT_COLUMNS)
        .order("created_at", { ascending: false });

      if (error) {
        if (isSessionExpiredError(error)) {
          onAuthFailure("expired");
          return;
        }
        const description = describeAnnouncementError(error.message);
        setListError(description);
        notify("error", `Gagal memuat pengumuman: ${description}`);
        return;
      }

      setAnnouncements(normalizeAnnouncements(data));
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tak terduga saat memuat pengumuman.";
      setListError(description);
      notify("error", description);
    } finally {
      setLoading(false);
    }
  }, [notify, onAuthFailure]);

  useEffect(() => {
    void (async () => {
      await loadAnnouncements();
    })();
  }, [loadAnnouncements]);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    };
  }, []);

  const activeCount = useMemo(
    () => announcements.filter((item) => item.isActive).length,
    [announcements],
  );

  const submitAnnouncement = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (sending) return;

      const trimmedTitle = title.trim();
      const trimmedMessage = message.trim();
      const errors: FieldErrors = {};
      if (trimmedTitle === "") errors.title = "Judul pengumuman wajib diisi.";
      if (trimmedMessage === "") errors.message = "Isi pesan wajib diisi.";
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) return;

      if (!userId) {
        notify("error", "Sesi Owner tidak dikenali. Silakan masuk kembali.");
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        notify("error", "Supabase belum dikonfigurasi.");
        return;
      }

      setSending(true);
      const { error } = await supabase.from("announcements").insert({
        title: trimmedTitle,
        message: trimmedMessage,
        is_active: true,
        created_by: userId,
      });
      setSending(false);

      if (error) {
        if (isSessionExpiredError(error)) {
          onAuthFailure("expired");
          return;
        }
        notify("error", describeAnnouncementError(error.message));
        return;
      }

      setTitle("");
      setMessage("");
      setFieldErrors({});
      notify("success", "Pengumuman terkirim ke semua pengguna ALLMOVA.");
      await loadAnnouncements();
    },
    [loadAnnouncements, message, notify, onAuthFailure, sending, title, userId],
  );

  const askDelete = useCallback((id: string) => {
    if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    setConfirmId(id);
    confirmTimer.current = window.setTimeout(() => setConfirmId(null), 8000);
  }, []);

  const cancelDelete = useCallback(() => {
    if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    setConfirmId(null);
  }, []);

  const deleteAnnouncement = useCallback(
    async (announcement: Announcement) => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        notify("error", "Supabase belum dikonfigurasi.");
        return;
      }

      setDeletingId(announcement.id);
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcement.id);
      setDeletingId(null);

      if (error) {
        if (isSessionExpiredError(error)) {
          onAuthFailure("expired");
          return;
        }
        notify("error", describeAnnouncementError(error.message));
        return;
      }

      cancelDelete();
      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcement.id),
      );
      notify("success", `Pengumuman "${announcement.title}" dihapus.`);
      await loadAnnouncements();
    },
    [cancelDelete, loadAnnouncements, notify, onAuthFailure],
  );

  return (
    <div className="container-page pb-14 pt-6 sm:pt-8">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">Broadcast</span>
        <h1 className="text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-[1.9rem]">
          Pengumuman <span className="text-lime">Notifikasi App</span>
        </h1>
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-white/45 sm:text-[13px]">
          Kirim pesan resmi yang langsung muncul di ikon lonceng aplikasi
          ALLMOVA. Setiap pengumuman aktif tampil untuk seluruh pengguna.
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-white/35">
          <span className="text-white/60">{announcements.length} pengumuman</span>
          <span aria-hidden="true">·</span>
          <span>{activeCount} aktif</span>
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <section
          aria-label="Form kirim pengumuman"
          className="rounded-2xl border border-hairline bg-surface/50 p-4 sm:p-5"
        >
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lime/25 bg-lime/[0.08] text-lime">
              <Megaphone className="h-4 w-4" strokeWidth={2.3} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[14px] font-extrabold tracking-[-0.01em] text-white">
                Kirim Pengumuman
              </h2>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-white/40">
                Pesan tampil di lonceng notifikasi aplikasi.
              </p>
            </div>
          </div>

          <form
            noValidate
            onSubmit={submitAnnouncement}
            className="mt-4 flex flex-col gap-3"
          >
            <div>
              <label htmlFor="announcement-title" className={labelClass}>
                Judul
              </label>
              <input
                id="announcement-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (fieldErrors.title) {
                    setFieldErrors((current) => ({ ...current, title: undefined }));
                  }
                }}
                placeholder="Contoh: Update fitur rute baru"
                aria-invalid={fieldErrors.title ? true : undefined}
                aria-describedby={
                  fieldErrors.title ? "announcement-title-error" : undefined
                }
                className={inputClass}
                disabled={sending}
              />
              {fieldErrors.title && (
                <p
                  id="announcement-title-error"
                  className="mt-1.5 text-[11px] font-semibold text-red-300"
                >
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="announcement-message" className={labelClass}>
                Isi Pesan
              </label>
              <textarea
                id="announcement-message"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  if (fieldErrors.message) {
                    setFieldErrors((current) => ({
                      ...current,
                      message: undefined,
                    }));
                  }
                }}
                rows={5}
                placeholder="Tulis pengumuman singkat dan jelas untuk pengguna…"
                aria-invalid={fieldErrors.message ? true : undefined}
                aria-describedby={
                  fieldErrors.message ? "announcement-message-error" : undefined
                }
                className="w-full resize-y rounded-xl border border-hairline bg-charcoal/60 px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-white placeholder:text-white/30 transition-colors focus:border-lime/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-45"
                disabled={sending}
              />
              {fieldErrors.message && (
                <p
                  id="announcement-message-error"
                  className="mt-1.5 text-[11px] font-semibold text-red-300"
                >
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={sending || !userId}
              className="btn-lime mt-1 h-11 w-full text-[13px] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
              ) : (
                <Send className="h-4 w-4" strokeWidth={2.4} />
              )}
              {sending ? "Mengirim…" : "Kirim ke Semua Pengguna"}
            </button>

            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-white/30">
              <BellRing className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2.2} />
              Pengumuman langsung aktif dan tidak bisa ditarik kembali, hanya
              bisa dihapus dari riwayat.
            </p>
          </form>
        </section>

        <section aria-label="Riwayat pengumuman" className="min-w-0">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-hairline bg-surface/50 px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-[12.5px] font-extrabold text-white">
                Riwayat Pengumuman
              </h2>
              <span className="rounded-full bg-white/[0.07] px-1.5 py-px text-[10px] font-extrabold text-white/45">
                {announcements.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void loadAnnouncements()}
              disabled={loading}
              aria-label="Muat ulang daftar pengumuman"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.02] text-white/70 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                strokeWidth={2.4}
              />
            </button>
          </div>

          {listError && (
            <div
              role="alert"
              className="mt-2.5 flex flex-col gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-[12.5px] text-red-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.3} />
                <span>Gagal memuat pengumuman: {listError}</span>
              </span>
              <button
                type="button"
                onClick={() => void loadAnnouncements()}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-red-400/30 px-3 text-[11.5px] font-bold text-red-100 transition-colors hover:bg-red-400/15 sm:self-auto"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
                Coba lagi
              </button>
            </div>
          )}

          {loading && announcements.length === 0 ? (
            <div className="mt-2.5 flex flex-col gap-2.5">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="h-[112px] animate-pulse rounded-2xl border border-hairline bg-surface/40"
                />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="mt-2.5 rounded-2xl border border-dashed border-hairline px-6 py-14 text-center">
              <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-lime/20 bg-lime/[0.06] text-lime">
                <Megaphone className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <p className="mt-3 text-[13px] font-bold text-white/75">
                Belum ada pengumuman
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/35">
                Pengumuman yang Anda kirim akan muncul di sini.
              </p>
            </div>
          ) : (
            <ul className="mt-2.5 flex flex-col gap-2.5">
              {announcements.map((announcement) => {
                const isConfirming = confirmId === announcement.id;
                const isDeleting = deletingId === announcement.id;

                return (
                  <li
                    key={announcement.id}
                    className="rounded-2xl border border-hairline bg-surface/60 p-3.5 transition-colors hover:border-white/[0.14]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words text-[13.5px] font-extrabold leading-snug tracking-[-0.01em] text-white">
                          {announcement.title || "Tanpa Judul"}
                        </h3>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-semibold text-white/35">
                          <span>{formatDateTimeId(announcement.createdAt)}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[9.5px] font-extrabold uppercase tracking-[0.08em] ${
                              announcement.isActive
                                ? "border-lime/30 bg-lime/[0.08] text-lime/85"
                                : "border-white/10 bg-white/[0.04] text-white/40"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                announcement.isActive ? "bg-lime" : "bg-white/30"
                              }`}
                            />
                            {announcement.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </p>
                      </div>

                      {!isConfirming && (
                        <button
                          type="button"
                          onClick={() => askDelete(announcement.id)}
                          aria-label={`Hapus pengumuman ${announcement.title}`}
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-400/25 bg-red-400/[0.05] text-red-200/80 transition-colors hover:border-red-400/45 hover:bg-red-400/[0.14]"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={2.4} />
                        </button>
                      )}
                    </div>

                    <p className="mt-2 whitespace-pre-line break-words text-[12.5px] leading-relaxed text-white/60">
                      {announcement.message || "—"}
                    </p>

                    {isConfirming && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-2.5 py-2">
                        <span className="text-[11px] font-bold text-red-200">
                          Hapus pengumuman ini?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={cancelDelete}
                            disabled={isDeleting}
                            className="inline-flex h-7 items-center gap-1 rounded-full border border-white/[0.14] px-2.5 text-[10.5px] font-bold text-white/70 transition-colors hover:bg-white/[0.06] disabled:opacity-45"
                          >
                            <X className="h-3 w-3" strokeWidth={2.6} />
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteAnnouncement(announcement)}
                            disabled={isDeleting}
                            className="inline-flex h-7 items-center gap-1 rounded-full bg-red-400/90 px-2.5 text-[10.5px] font-extrabold text-[#2a0b0b] transition-colors hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.6} />
                            ) : (
                              <Check className="h-3 w-3" strokeWidth={2.8} />
                            )}
                            Ya, Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-hairline bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-white/30 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Pengumuman disimpan di tabel{" "}
          <code className="font-mono text-white/45">public.announcements</code> dan
          hanya dapat dikelola akun Owner.
        </p>
        <a
          href="https://supabase.com/dashboard/project/adnboduimzesbvbejdwr/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-white/45 transition-colors hover:text-lime"
        >
          Buka database Supabase
          <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
        </a>
      </div>
    </div>
  );
}
