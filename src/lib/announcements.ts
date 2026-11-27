export type Announcement = {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string | null;
};

export type AnnouncementInput = {
  title: string;
  message: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function firstString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function firstBoolean(
  row: Record<string, unknown>,
  keys: string[],
  fallback: boolean,
): boolean {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "t", "1", "yes", "ya"].includes(normalized)) return true;
      if (["false", "f", "0", "no", "tidak"].includes(normalized)) return false;
    }
  }
  return fallback;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function normalizeAnnouncement(raw: unknown): Announcement {
  const row = asRecord(raw);

  return {
    id: firstString(row, ["id", "announcement_id"]) ?? "",
    title: firstString(row, ["title", "judul"]) ?? "",
    message: firstString(row, ["message", "body", "content", "pesan"]) ?? "",
    isActive: firstBoolean(row, ["is_active", "active", "published"], true),
    createdBy: firstString(row, ["created_by", "author_id", "user_id"]),
    createdAt: normalizeDate(row["created_at"] ?? row["created"]),
  };
}

export function normalizeAnnouncements(payload: unknown): Announcement[] {
  const rows = Array.isArray(payload)
    ? payload
    : (() => {
        const record = asRecord(payload);
        const nested = record.announcements ?? record.data ?? record.rows;
        return Array.isArray(nested) ? nested : [];
      })();

  return rows
    .map(normalizeAnnouncement)
    .filter((item) => item.id !== "" || item.title !== "")
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
}

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTimeId(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

export function describeAnnouncementError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("could not find the table") || text.includes("pgrst205")) {
    return "Tabel public.announcements belum tersedia di Supabase. Buat tabelnya terlebih dahulu.";
  }
  if (text.includes("permission denied for table")) {
    return "Akun Owner belum punya izin pada tabel public.announcements. Aktifkan GRANT dan RLS policy untuk role authenticated.";
  }
  if (text.includes("row-level security") || text.includes("violates row-level")) {
    return "RLS menolak aksi ini. Pastikan policy public.announcements mengizinkan akun Owner.";
  }
  if (text.includes("invalid api key")) {
    return "Anon public key Supabase tidak valid. Periksa kembali src/config/supabase.ts.";
  }
  return message;
}
