"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Crown,
  Loader2,
  LogOut,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Settings2,
  Smartphone,
  Timer,
  TimerOff,
  Users,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { CuratedRoutesPanel } from "@/components/admin/CuratedRoutesPanel";
import { ManageUserModal } from "@/components/admin/ManageUserModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { smallButtonClass } from "@/components/admin/styles";
import type { ToastKind } from "@/components/admin/Toast";
import {
  countUsers,
  filterUsers,
  formatDateId,
  formatExpiryDetail,
  getUserStatus,
  type AdminUser,
  type SubscriptionPatch,
  type UserFilter,
} from "@/lib/admin";

type AdminDashboardProps = {
  email: string;
  users: AdminUser[];
  loading: boolean;
  listError: string | null;
  onRefresh: () => void;
  onSignOut: () => void;
  onUpdateSubscription: (
    userId: string,
    patch: SubscriptionPatch,
  ) => Promise<string | null>;
  onResetDevice: (userId: string) => Promise<string | null>;
  onAuthFailure: (kind: "unauthorized" | "expired") => void;
  notify: (kind: ToastKind, message: string) => void;
};

type AdminTab = "users" | "routes";

const filterTabs: { value: UserFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pro", label: "PRO" },
  { value: "trial", label: "PRO TRIAL" },
  { value: "free", label: "FREE" },
];

function initials(user: AdminUser): string {
  const source = (user.displayName || user.email || "?").trim();
  return source.charAt(0).toUpperCase();
}

function shortDevice(deviceId: string | null): string | null {
  if (!deviceId) return null;
  return deviceId.length > 12 ? `${deviceId.slice(0, 12)}…` : deviceId;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Users;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
          {label}
        </p>
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${accent}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2.3} />
        </span>
      </div>
      <p className="mt-3 text-[27px] font-extrabold leading-none tracking-[-0.03em] text-white">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-medium text-white/35">{hint}</p>
    </div>
  );
}

function DeviceState({ deviceId }: { deviceId: string | null }) {
  if (!deviceId) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-white/35">
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        Kosong
      </span>
    );
  }

  return (
    <div className="min-w-0">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/[0.07] px-2 py-0.5 text-[10.5px] font-bold text-lime/85">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime animate-pulse-dot" />
        Aktif
      </span>
      <p
        className="mt-0.5 truncate font-mono text-[10px] text-white/30"
        title={deviceId}
      >
        {shortDevice(deviceId)}
      </p>
    </div>
  );
}

function UserIdentity({ user }: { user: AdminUser }) {
  return (
    <div className="flex min-w-0 max-w-[210px] items-center gap-2.5 xl:max-w-[280px]">
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[13px] font-extrabold text-white/70"
      >
        {initials(user)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-bold text-white">
          {user.displayName || "Tanpa Nama"}
        </p>
        <p className="truncate text-[11px] font-medium text-white/40">
          {user.email || "Email tidak tersedia"}
        </p>
      </div>
    </div>
  );
}

export function AdminDashboard({
  email,
  users,
  loading,
  listError,
  onRefresh,
  onSignOut,
  onUpdateSubscription,
  onResetDevice,
  onAuthFailure,
  notify,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("users");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => countUsers(users), [users]);
  const visibleUsers = useMemo(
    () => filterUsers(users, query, filter),
    [users, query, filter],
  );
  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedId) ?? null,
    [users, selectedId],
  );

  const closeModal = useCallback(() => setSelectedId(null), []);

  const tabCount: Record<UserFilter, number> = {
    all: counts.total,
    pro: counts.pro,
    trial: counts.trial,
    free: counts.free,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-hairline bg-charcoal/85 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Link
              href="/"
              aria-label="ALLMOVA — kembali ke beranda"
              className="shrink-0 sm:hidden"
            >
              <LogoMark className="h-5 w-6" />
            </Link>
            <Logo href="/" size="sm" className="hidden sm:inline-flex" />
            <span aria-hidden="true" className="hidden h-5 w-px bg-white/10 sm:block" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-extrabold tracking-[-0.01em] text-white">
                ALLMOVA Admin
              </p>
              <p className="truncate text-[11px] font-medium text-white/40">
                {email}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {tab === "users" && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className={`${smallButtonClass} px-2.5 sm:px-3.5`}
                aria-label="Muat ulang daftar pengguna"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                  strokeWidth={2.4}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-red-400/25 bg-red-400/[0.07] px-2.5 text-[12px] font-bold text-red-200/90 transition-colors hover:border-red-400/45 hover:bg-red-400/[0.14] sm:px-3.5"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2.4} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Navigasi panel admin"
        className="sticky top-16 z-30 border-b border-hairline bg-charcoal/90 backdrop-blur-xl"
      >
        <div
          role="tablist"
          aria-label="Bagian admin"
          className="container-page no-scrollbar flex items-center gap-1.5 overflow-x-auto py-2.5"
        >
          {(
            [
              { value: "users", label: "Pengguna", icon: Users, count: counts.total },
              { value: "routes", label: "Rute Favorit", icon: RouteIcon, count: null },
            ] as const
          ).map((item) => {
            const active = tab === item.value;
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.value)}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-bold transition-colors ${
                  active
                    ? "border-lime/50 bg-lime text-charcoal"
                    : "border-hairline bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                {item.label}
                {item.count !== null && (
                  <span
                    className={`rounded-full px-1.5 py-px text-[10px] font-extrabold ${
                      active ? "bg-charcoal/15 text-charcoal" : "bg-white/[0.07] text-white/45"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1">
        {tab === "routes" ? (
          <CuratedRoutesPanel notify={notify} onAuthFailure={onAuthFailure} />
        ) : (
          <div className="container-page pb-14 pt-6 sm:pt-8">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">Manajemen Langganan</span>
              <h1 className="text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-[1.9rem]">
                Kendali <span className="text-lime">Tier &amp; Akses</span>
              </h1>
              <p className="max-w-2xl text-[12.5px] leading-relaxed text-white/45 sm:text-[13px]">
                Atur masa aktif Pro, tier langganan, status Owner, dan reset sesi
                perangkat pengguna ALLMOVA langsung dari satu panel.
              </p>
            </div>

            <section
              aria-label="Ringkasan pengguna"
              className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
            >
              <StatCard
                label="Total Pengguna"
                value={counts.total}
                hint="Seluruh akun terdaftar"
                icon={Users}
                accent="border-white/10 bg-white/[0.05] text-white/70"
              />
              <StatCard
                label="PRO Aktif"
                value={counts.pro}
                hint="Termasuk akun Owner"
                icon={Crown}
                accent="border-lime/30 bg-lime/10 text-lime"
              />
              <StatCard
                label="Trial Aktif"
                value={counts.trial}
                hint="Masa uji coba berjalan"
                icon={Timer}
                accent="border-sky-400/30 bg-sky-400/10 text-sky-200"
              />
              <StatCard
                label="Free"
                value={counts.free}
                hint="Tanpa langganan aktif"
                icon={TimerOff}
                accent="border-white/10 bg-white/[0.04] text-white/45"
              />
            </section>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-[320px]">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
                  strokeWidth={2.2}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari email atau nama…"
                  aria-label="Cari pengguna berdasarkan email atau nama"
                  className="h-10 w-full rounded-full border border-hairline bg-surface/70 pl-10 pr-4 text-[12.5px] font-medium text-white placeholder:text-white/30 transition-colors focus:border-lime/40 focus:outline-none"
                />
              </div>

              <div
                role="tablist"
                aria-label="Filter status pengguna"
                className="flex flex-wrap gap-1.5"
              >
                {filterTabs.map((tab) => {
                  const active = filter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(tab.value)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
                        active
                          ? "border-lime/50 bg-lime text-charcoal"
                          : "border-hairline bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 py-px text-[10px] font-extrabold ${
                          active ? "bg-charcoal/15 text-charcoal" : "bg-white/[0.07] text-white/45"
                        }`}
                      >
                        {tabCount[tab.value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {listError && (
              <div
                role="alert"
                className="mt-4 flex flex-col gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-[12.5px] text-red-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.3} />
                  <span>Gagal memuat daftar pengguna: {listError}</span>
                </span>
                <button
                  type="button"
                  onClick={onRefresh}
                  className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-red-400/30 px-3 text-[11.5px] font-bold text-red-100 transition-colors hover:bg-red-400/15 sm:self-auto"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
                  Coba lagi
                </button>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[11.5px] font-medium text-white/35">
                {loading && users.length === 0
                  ? "Memuat pengguna…"
                  : `Menampilkan ${visibleUsers.length} dari ${users.length} pengguna`}
              </p>
              {loading && users.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-lime/70">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.4} />
                  Menyegarkan…
                </span>
              )}
            </div>

            <div className="mt-2.5 hidden overflow-x-auto rounded-2xl border border-hairline bg-surface/50 lg:block">
              <table className="w-full min-w-[780px] text-left">
                <thead>
                  <tr className="border-b border-hairline bg-white/[0.02] text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/40">
                    <th scope="col" className="px-4 py-3 font-bold">
                      Pengguna
                    </th>
                    <th scope="col" className="px-2.5 py-3 font-bold">
                      Status
                    </th>
                    <th scope="col" className="px-2.5 py-3 font-bold">
                      Kadaluarsa
                    </th>
                    <th scope="col" className="px-2.5 py-3 font-bold">
                      Sumber
                    </th>
                    <th scope="col" className="px-2.5 py-3 font-bold">
                      Perangkat
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.025]"
                      >
                        <td className="px-4 py-3">
                          <UserIdentity user={user} />
                        </td>
                        <td className="px-2.5 py-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-2.5 py-3">
                          <p className="text-[12px] font-semibold text-white/75">
                            {user.isOwner ? "Lifetime" : formatDateId(user.proExpiresAt)}
                          </p>
                          <p className="mt-0.5 text-[10.5px] text-white/30">
                            {formatExpiryDetail(user)}
                          </p>
                        </td>
                        <td className="px-2.5 py-3">
                          <span className="inline-flex max-w-[110px] truncate rounded-md border border-hairline bg-white/[0.03] px-2 py-0.5 font-mono text-[10.5px] text-white/45">
                            {user.source ?? "—"}
                          </span>
                        </td>
                        <td className="px-2.5 py-3">
                          <DeviceState deviceId={user.activeDeviceId} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedId(user.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] px-3 text-[11.5px] font-bold text-white/75 transition-colors hover:border-lime/40 hover:bg-lime/10 hover:text-lime"
                          >
                            <Settings2 className="h-3.5 w-3.5" strokeWidth={2.3} />
                            Kelola
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {visibleUsers.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-[13px] font-bold text-white/70">
                    {loading ? "Memuat data pengguna…" : "Tidak ada pengguna yang cocok"}
                  </p>
                  <p className="mt-1 text-[12px] text-white/35">
                    {query || filter !== "all"
                      ? "Coba ubah kata kunci pencarian atau filter status."
                      : "Daftar pengguna masih kosong."}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2.5 flex flex-col gap-2.5 lg:hidden">
              {visibleUsers.map((user) => {
                const status = getUserStatus(user);
                return (
                  <article
                    key={user.id}
                    className="rounded-2xl border border-hairline bg-surface/60 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <UserIdentity user={user} />
                      <StatusBadge status={status} />
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.05] pt-2.5">
                      <div className="min-w-0">
                        <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                          Kadaluarsa
                        </dt>
                        <dd className="mt-0.5 truncate text-[11.5px] font-semibold text-white/75">
                          {user.isOwner ? "Lifetime" : formatDateId(user.proExpiresAt)}
                        </dd>
                        <dd className="truncate text-[10px] text-white/30">
                          {formatExpiryDetail(user)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                          Sumber
                        </dt>
                        <dd className="mt-0.5 truncate font-mono text-[11px] text-white/55">
                          {user.source ?? "—"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.05] pt-2.5">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Smartphone
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0 text-white/30"
                          strokeWidth={2.2}
                        />
                        <DeviceState deviceId={user.activeDeviceId} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedId(user.id)}
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-lime/30 bg-lime/[0.08] px-3 text-[11.5px] font-bold text-lime transition-colors hover:bg-lime/15"
                      >
                        <Settings2 className="h-3.5 w-3.5" strokeWidth={2.3} />
                        Kelola
                      </button>
                    </div>
                  </article>
                );
              })}

              {visibleUsers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-hairline px-5 py-10 text-center">
                  <p className="text-[13px] font-bold text-white/70">
                    {loading ? "Memuat data pengguna…" : "Tidak ada pengguna yang cocok"}
                  </p>
                  <p className="mt-1 text-[12px] text-white/35">
                    Coba ubah kata kunci atau filter status.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-hairline bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-white/30 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Data ditarik dari RPC{" "}
                <code className="font-mono text-white/45">admin_list_users</code> dan
                hanya dapat diakses akun Owner.
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
        )}
      </main>

      {selectedUser && (
        <ManageUserModal
          key={selectedUser.id}
          user={selectedUser}
          onClose={closeModal}
          onSave={onUpdateSubscription}
          onResetDevice={onResetDevice}
          notify={notify}
        />
      )}
    </div>
  );
}
