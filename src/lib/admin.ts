export type SubscriptionTier = "pro" | "trial" | "free";

export type UserStatus = "owner" | "pro" | "trial" | "expired";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  tier: SubscriptionTier;
  proExpiresAt: string | null;
  isOwner: boolean;
  source: string | null;
  activeDeviceId: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
};

export type SubscriptionPatch = {
  tier: SubscriptionTier;
  proExpiresAt: string | null;
  isOwner: boolean;
};

export type UserFilter = "all" | "pro" | "trial" | "expired";

export type UserCounts = {
  total: number;
  pro: number;
  trial: number;
  expired: number;
};

const TIERS: SubscriptionTier[] = ["pro", "trial", "free"];

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

function firstBoolean(row: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "t" || normalized === "1") return true;
      if (normalized === "false" || normalized === "f" || normalized === "0") return false;
    }
    if (typeof value === "number") return value !== 0;
  }
  return false;
}

function normalizeTier(value: string | null): SubscriptionTier {
  const normalized = (value ?? "").toLowerCase();
  return TIERS.find((tier) => tier === normalized) ?? "free";
}

function normalizeDate(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function normalizeAdminUser(raw: unknown): AdminUser {
  const row = asRecord(raw);

  return {
    id: firstString(row, ["id", "user_id", "userId"]) ?? "",
    email: firstString(row, ["email", "user_email"]) ?? "",
    displayName:
      firstString(row, ["display_name", "full_name", "name", "username"]) ?? "",
    tier: normalizeTier(firstString(row, ["tier", "subscription_tier", "plan"])),
    proExpiresAt: normalizeDate(
      firstString(row, ["pro_expires_at", "pro_expiry", "expires_at", "expired_at"]),
    ),
    isOwner: firstBoolean(row, ["is_owner", "owner", "is_admin"]),
    source: firstString(row, ["subscription_source", "source"]),
    activeDeviceId: firstString(row, [
      "active_device_id",
      "device_id",
      "active_session_id",
    ]),
    createdAt: normalizeDate(firstString(row, ["created_at", "registered_at"])),
    lastSignInAt: normalizeDate(
      firstString(row, ["last_sign_in_at", "last_login_at"]),
    ),
  };
}

export function normalizeAdminUsers(payload: unknown): AdminUser[] {
  const rows = Array.isArray(payload)
    ? payload
    : (() => {
        const record = asRecord(payload);
        const nested = record.users ?? record.data ?? record.rows;
        return Array.isArray(nested) ? nested : [];
      })();

  return rows
    .map(normalizeAdminUser)
    .filter((user) => user.id !== "" || user.email !== "")
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.email.localeCompare(b.email);
    });
}

export function isExpired(user: AdminUser, now: number = Date.now()): boolean {
  if (!user.proExpiresAt) return true;
  const expiry = new Date(user.proExpiresAt).getTime();
  return Number.isNaN(expiry) || expiry <= now;
}

export function getUserStatus(
  user: AdminUser,
  now: number = Date.now(),
): UserStatus {
  if (user.isOwner) return "owner";
  if (user.tier === "pro") {
    // Pro tanpa tanggal kadaluarsa dianggap lifetime.
    return user.proExpiresAt === null || !isExpired(user, now) ? "pro" : "expired";
  }
  if (user.tier === "trial") return isExpired(user, now) ? "expired" : "trial";
  return "expired";
}

export const statusLabels: Record<UserStatus, string> = {
  owner: "👑 OWNER",
  pro: "PRO",
  trial: "TRIAL",
  expired: "EXPIRED",
};

export function countUsers(
  users: AdminUser[],
  now: number = Date.now(),
): UserCounts {
  return users.reduce<UserCounts>(
    (acc, user) => {
      const status = getUserStatus(user, now);
      acc.total += 1;
      if (status === "owner" || status === "pro") acc.pro += 1;
      else if (status === "trial") acc.trial += 1;
      else acc.expired += 1;
      return acc;
    },
    { total: 0, pro: 0, trial: 0, expired: 0 },
  );
}

export function filterUsers(
  users: AdminUser[],
  query: string,
  filter: UserFilter,
  now: number = Date.now(),
): AdminUser[] {
  const needle = query.trim().toLowerCase();

  return users.filter((user) => {
    const status = getUserStatus(user, now);
    const matchesFilter =
      filter === "all" ||
      (filter === "pro" && (status === "owner" || status === "pro")) ||
      (filter === "trial" && status === "trial") ||
      (filter === "expired" && status === "expired");

    if (!matchesFilter) return false;
    if (needle === "") return true;

    return (
      user.email.toLowerCase().includes(needle) ||
      user.displayName.toLowerCase().includes(needle)
    );
  });
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDateId(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

/** Sisa hari menuju kadaluarsa (negatif bila sudah lewat). */
export function daysUntilExpiry(
  value: string | null,
  now: number = Date.now(),
): number | null {
  if (!value) return null;
  const expiry = new Date(value).getTime();
  if (Number.isNaN(expiry)) return null;
  return Math.ceil((expiry - now) / 86_400_000);
}

export function formatExpiryDetail(
  user: AdminUser,
  now: number = Date.now(),
): string {
  if (user.isOwner) return "Lifetime akses Owner";
  if (user.tier === "pro" && user.proExpiresAt === null) return "Pro tanpa batas waktu";

  const days = daysUntilExpiry(user.proExpiresAt, now);
  if (days === null) return "Belum ada masa aktif";
  if (days <= 0) return `Berakhir ${Math.abs(days)} hari lalu`;
  return `Sisa ${days} hari`;
}

/** +N hari dari tanggal kadaluarsa aktif, atau dari hari ini bila sudah lewat. */
export function addDaysToExpiry(
  currentExpiry: string | null,
  days: number,
  now: number = Date.now(),
): string {
  const current = currentExpiry ? new Date(currentExpiry).getTime() : NaN;
  const base = Number.isFinite(current) && current > now ? current : now;
  return new Date(base + days * 86_400_000).toISOString();
}

/** ISO string → nilai untuk input datetime-local (waktu lokal perangkat). */
export function toDateTimeLocalValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Nilai input datetime-local → ISO string (null bila kosong/tidak valid). */
export function fromDateTimeLocalValue(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function isUnauthorizedError(error: {
  message?: string;
  code?: string;
  details?: string | null;
}): boolean {
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return (
    text.includes("unauthorized") ||
    text.includes("akses ditolak") ||
    text.includes("not owner") ||
    text.includes("forbidden") ||
    text.includes("permission denied")
  );
}

export function isSessionExpiredError(error: {
  message?: string;
  code?: string;
}): boolean {
  const text = `${error.message ?? ""}`.toLowerCase();
  return (
    error.code === "PGRST301" ||
    text.includes("jwt expired") ||
    text.includes("jwt is expired") ||
    text.includes("invalid jwt") ||
    text.includes("token has expired")
  );
}

export function describeRpcError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("could not find the function")) {
    return "Fungsi RPC admin belum tersedia di Supabase. Jalankan SQL fungsi admin terlebih dahulu.";
  }
  if (text.includes("invalid api key")) {
    return "Anon public key Supabase tidak valid. Periksa kembali src/config/supabase.ts.";
  }
  if (isSessionExpiredError({ message })) {
    return "Sesi login berakhir. Silakan masuk kembali.";
  }
  return message;
}

export function mapAuthErrorMessage(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("invalid login credentials")) {
    return "Email atau password salah. Silakan coba lagi.";
  }
  if (text.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Cek kotak masuk Anda terlebih dahulu.";
  }
  if (text.includes("too many requests") || text.includes("rate limit")) {
    return "Terlalu banyak percobaan login. Tunggu beberapa saat lalu coba lagi.";
  }
  if (text.includes("failed to fetch") || text.includes("network")) {
    return "Tidak dapat terhubung ke Supabase. Periksa koneksi internet Anda.";
  }
  return message;
}
