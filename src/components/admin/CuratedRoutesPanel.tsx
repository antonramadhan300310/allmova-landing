"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bike,
  Check,
  Footprints,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Trash2,
  Trees,
  X,
} from "lucide-react";
import { RouteFormModal } from "@/components/admin/RouteFormModal";
import { RouteShapePreview } from "@/components/admin/RouteShapePreview";
import type { ToastKind } from "@/components/admin/Toast";
import { getSupabaseClient } from "@/config/supabase";
import {
  describeRpcError,
  isSessionExpiredError,
} from "@/lib/admin";
import {
  SPORT_TYPES,
  difficultyLabels,
  filterCuratedRoutes,
  formatDistanceKm,
  formatElevation,
  isUnauthorizedRpcError,
  normalizeCuratedRoutes,
  sportFilterLabels,
  toUpsertArgs,
  type CuratedRoute,
  type CuratedRouteInput,
  type SportFilter,
  type SportType,
} from "@/lib/curatedRoutes";

type CuratedRoutesPanelProps = {
  notify: (kind: ToastKind, message: string) => void;
  onAuthFailure: (kind: "unauthorized" | "expired") => void;
};

const sportStyles: Record<SportType, string> = {
  cycling: "border-sky-400/35 bg-sky-400/10 text-sky-200",
  run: "border-orange-400/35 bg-orange-400/10 text-orange-200",
  walking: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  hike: "border-violet-400/35 bg-violet-400/10 text-violet-200",
};

const sportIcons: Record<SportType, typeof Bike> = {
  cycling: Bike,
  run: Footprints,
  walking: Footprints,
  hike: Trees,
};

const difficultyStyles: Record<string, string> = {
  easy: "text-emerald-300",
  moderate: "text-amber-300",
  hard: "text-red-300",
};

function routeToInput(
  route: CuratedRoute,
  overrides: Partial<CuratedRouteInput> = {},
): CuratedRouteInput {
  return {
    id: route.id,
    name: route.name,
    city: route.city,
    sportType: route.sportType,
    distanceKm: route.distanceKm,
    elevationGainM: route.elevationGainM,
    difficulty: route.difficulty,
    description: route.description,
    isPro: route.isPro,
    isActive: route.isActive,
    coordinates: route.coordinates,
    ...overrides,
  };
}

export function CuratedRoutesPanel({
  notify,
  onAuthFailure,
}: CuratedRoutesPanelProps) {
  const [routes, setRoutes] = useState<CuratedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<SportFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CuratedRoute | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const confirmTimer = useRef<number | null>(null);

  const loadRoutes = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      setListError("Supabase belum dikonfigurasi.");
      return;
    }

    setLoading(true);
    setListError(null);

    try {
      const { data, error } = await supabase.rpc("admin_list_curated_routes");

      if (error) {
        if (isUnauthorizedRpcError(error)) {
          onAuthFailure("unauthorized");
          return;
        }
        if (isSessionExpiredError(error)) {
          onAuthFailure("expired");
          return;
        }
        const message = describeRpcError(error.message);
        setListError(message);
        notify("error", `Gagal memuat rute favorit: ${message}`);
        return;
      }

      setRoutes(normalizeCuratedRoutes(data));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tak terduga saat memuat rute favorit.";
      setListError(message);
      notify("error", message);
    } finally {
      setLoading(false);
    }
  }, [notify, onAuthFailure]);

  useEffect(() => {
    void (async () => {
      await loadRoutes();
    })();
  }, [loadRoutes]);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    };
  }, []);

  const counts = useMemo(() => {
    const base: Record<SportFilter, number> = {
      all: routes.length,
      cycling: 0,
      run: 0,
      walking: 0,
      hike: 0,
    };
    for (const route of routes) base[route.sportType] += 1;
    return base;
  }, [routes]);

  const activeCount = useMemo(
    () => routes.filter((route) => route.isActive).length,
    [routes],
  );
  const proCount = useMemo(
    () => routes.filter((route) => route.isPro).length,
    [routes],
  );
  const visibleRoutes = useMemo(
    () => filterCuratedRoutes(routes, query, sport),
    [routes, query, sport],
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((route: CuratedRoute) => {
    setEditing(route);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const saveRoute = useCallback(
    async (input: CuratedRouteInput): Promise<string | null> => {
      const supabase = getSupabaseClient();
      if (!supabase) return "Supabase belum dikonfigurasi.";

      const { error } = await supabase.rpc(
        "admin_upsert_curated_route",
        toUpsertArgs(input),
      );

      if (error) {
        if (isUnauthorizedRpcError(error)) onAuthFailure("unauthorized");
        if (isSessionExpiredError(error)) onAuthFailure("expired");
        return describeRpcError(error.message);
      }

      await loadRoutes();
      return null;
    },
    [loadRoutes, onAuthFailure],
  );

  const toggleActive = useCallback(
    async (route: CuratedRoute) => {
      if (togglingId) return;
      setTogglingId(route.id);
      const nextActive = !route.isActive;

      const error = await saveRoute(
        routeToInput(route, { isActive: nextActive }),
      );

      setTogglingId(null);
      if (error) {
        notify("error", error);
        return;
      }
      notify(
        "success",
        nextActive
          ? `"${route.name}" ditayangkan.`
          : `"${route.name}" disimpan sebagai draft.`,
      );
    },
    [notify, saveRoute, togglingId],
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

  const deleteRoute = useCallback(
    async (route: CuratedRoute) => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        notify("error", "Supabase belum dikonfigurasi.");
        return;
      }

      setDeletingId(route.id);
      const { error } = await supabase.rpc("admin_delete_curated_route", {
        p_id: route.id,
      });
      setDeletingId(null);

      if (error) {
        if (isUnauthorizedRpcError(error)) onAuthFailure("unauthorized");
        if (isSessionExpiredError(error)) onAuthFailure("expired");
        notify("error", describeRpcError(error.message));
        return;
      }

      cancelDelete();
      setRoutes((current) => current.filter((item) => item.id !== route.id));
      notify("success", `Rute "${route.name}" dihapus.`);
      await loadRoutes();
    },
    [cancelDelete, loadRoutes, notify, onAuthFailure],
  );

  return (
    <div className="container-page pb-14 pt-6 sm:pt-8">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">Kurasi Rute</span>
        <h1 className="text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-[1.9rem]">
          Rute <span className="text-lime">Favorit</span>
        </h1>
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-white/45 sm:text-[13px]">
          Kelola koleksi rute kurasi aplikasi: unggah GPX, atur jarak, elevasi,
          tingkat kesulitan, dan status tayang.
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-white/35">
          <span className="text-white/60">{routes.length} rute</span>
          <span aria-hidden="true">·</span>
          <span>{activeCount} aktif</span>
          <span aria-hidden="true">·</span>
          <span>{proCount} khusus PRO</span>
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-hairline bg-surface/50 p-3 sm:p-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-[340px]">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              strokeWidth={2.2}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama rute atau kota…"
              aria-label="Cari rute berdasarkan nama atau kota"
              className="h-10 w-full rounded-full border border-hairline bg-charcoal/60 pl-10 pr-4 text-[12.5px] font-medium text-white placeholder:text-white/30 transition-colors focus:border-lime/40 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:ml-auto">
            <button
              type="button"
              onClick={() => void loadRoutes()}
              disabled={loading}
              aria-label="Muat ulang daftar rute"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.02] text-white/70 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                strokeWidth={2.4}
              />
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="btn-lime h-10 flex-1 text-[12.5px] sm:flex-none sm:px-4"
            >
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              Tambah Rute
            </button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Filter tipe olahraga"
          className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5"
        >
          {(["all", ...SPORT_TYPES] as SportFilter[]).map((value) => {
            const active = sport === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSport(value)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
                  active
                    ? "border-lime/50 bg-lime text-charcoal"
                    : "border-hairline bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                {sportFilterLabels[value]}
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] font-extrabold ${
                    active
                      ? "bg-charcoal/15 text-charcoal"
                      : "bg-white/[0.07] text-white/45"
                  }`}
                >
                  {counts[value]}
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
            <span>Gagal memuat rute favorit: {listError}</span>
          </span>
          <button
            type="button"
            onClick={() => void loadRoutes()}
            className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-red-400/30 px-3 text-[11.5px] font-bold text-red-100 transition-colors hover:bg-red-400/15 sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
            Coba lagi
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11.5px] font-medium text-white/35">
          {loading && routes.length === 0
            ? "Memuat rute favorit…"
            : `Menampilkan ${visibleRoutes.length} dari ${routes.length} rute`}
        </p>
        {loading && routes.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-lime/70">
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.4} />
            Menyegarkan…
          </span>
        )}
      </div>

      {loading && routes.length === 0 ? (
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-[212px] animate-pulse rounded-2xl border border-hairline bg-surface/40"
            />
          ))}
        </div>
      ) : visibleRoutes.length === 0 ? (
        <div className="mt-2.5 rounded-2xl border border-dashed border-hairline px-6 py-14 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-lime/20 bg-lime/[0.06] text-lime">
            <RouteIcon className="h-6 w-6" strokeWidth={2.2} />
          </span>
          <p className="mt-3 text-[13px] font-bold text-white/75">
            {routes.length === 0
              ? "Belum ada rute favorit"
              : "Tidak ada rute yang cocok"}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/35">
            {routes.length === 0
              ? "Tambahkan rute pertama dengan mengunggah file GPX."
              : "Coba ubah kata kunci pencarian atau filter olahraga."}
          </p>
          {routes.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              className="btn-lime mt-4 h-10 px-4 text-[12.5px]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              Tambah Rute
            </button>
          )}
        </div>
      ) : (
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleRoutes.map((route) => {
            const SportIcon = sportIcons[route.sportType];
            const isConfirming = confirmId === route.id;
            const isToggling = togglingId === route.id;

            return (
              <article
                key={route.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface/60 transition-colors hover:border-white/[0.14]"
              >
                <div className="relative h-24 border-b border-white/[0.05] bg-[radial-gradient(ellipse_at_center,rgba(185,245,30,0.08),transparent_72%)]">
                  {route.coordinates.length > 1 ? (
                    <RouteShapePreview
                      coordinates={route.coordinates}
                      className="h-full w-full px-1 py-1"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center gap-1.5 text-[11px] font-semibold text-white/25">
                      <RouteIcon className="h-4 w-4" strokeWidth={2.2} />
                      Belum ada jalur GPX
                    </span>
                  )}
                  <span
                    className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold lowercase tracking-[0.04em] ${sportStyles[route.sportType]}`}
                  >
                    <SportIcon className="h-3 w-3" strokeWidth={2.4} />
                    {sportFilterLabels[route.sportType].toLowerCase()}
                  </span>
                  <span
                    className={`absolute right-2.5 top-2.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                      route.isPro
                        ? "border-amber-300/40 bg-amber-300/15 text-amber-200"
                        : "border-white/10 bg-charcoal/70 text-white/55"
                    }`}
                  >
                    {route.isPro ? "PRO" : "Gratis"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  <h3 className="line-clamp-2 text-[13.5px] font-extrabold leading-snug tracking-[-0.01em] text-white">
                    {route.name || "Tanpa Nama"}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-white/40">
                    <MapPin className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                    <span className="truncate">{route.city || "Tanpa kota"}</span>
                  </p>

                  <dl className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-2">
                    <div>
                      <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">
                        Jarak
                      </dt>
                      <dd className="mt-0.5 text-[11.5px] font-extrabold text-white/85">
                        {formatDistanceKm(route.distanceKm)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">
                        Elevasi
                      </dt>
                      <dd className="mt-0.5 text-[11.5px] font-extrabold text-white/85">
                        {formatElevation(route.elevationGainM)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">
                        Kesulitan
                      </dt>
                      <dd
                        className={`mt-0.5 text-[11.5px] font-extrabold ${
                          difficultyStyles[route.difficulty] ?? "text-white/85"
                        }`}
                      >
                        {difficultyLabels[route.difficulty]}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-3">
                    {isConfirming ? (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-2.5 py-2">
                        <span className="text-[11px] font-bold text-red-200">
                          Hapus rute ini?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={cancelDelete}
                            disabled={deletingId === route.id}
                            className="inline-flex h-7 items-center gap-1 rounded-full border border-white/[0.14] px-2.5 text-[10.5px] font-bold text-white/70 transition-colors hover:bg-white/[0.06] disabled:opacity-45"
                          >
                            <X className="h-3 w-3" strokeWidth={2.6} />
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteRoute(route)}
                            disabled={deletingId === route.id}
                            className="inline-flex h-7 items-center gap-1 rounded-full bg-red-400/90 px-2.5 text-[10.5px] font-extrabold text-[#2a0b0b] transition-colors hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === route.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.6} />
                            ) : (
                              <Check className="h-3 w-3" strokeWidth={2.8} />
                            )}
                            Ya, Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={route.isActive}
                          aria-label={
                            route.isActive
                              ? `Jadikan ${route.name} draft`
                              : `Tayangkan ${route.name}`
                          }
                          onClick={() => void toggleActive(route)}
                          disabled={isToggling}
                          className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                            route.isActive
                              ? "border-lime/35 bg-lime/10 text-lime"
                              : "border-white/10 bg-white/[0.04] text-white/45 hover:border-white/25 hover:text-white/70"
                          }`}
                          title="Klik untuk mengubah status tayang"
                        >
                          {isToggling ? (
                            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.6} />
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                route.isActive ? "bg-lime" : "bg-white/30"
                              }`}
                            />
                          )}
                          {route.isActive ? "Aktif" : "Draft"}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(route)}
                            className="inline-flex h-7 items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.03] px-2.5 text-[10.5px] font-bold text-white/70 transition-colors hover:border-lime/40 hover:bg-lime/10 hover:text-lime"
                          >
                            <Pencil className="h-3 w-3" strokeWidth={2.4} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => askDelete(route.id)}
                            aria-label={`Hapus ${route.name}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-400/25 bg-red-400/[0.05] text-red-200/80 transition-colors hover:border-red-400/45 hover:bg-red-400/[0.14]"
                          >
                            <Trash2 className="h-3 w-3" strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-hairline bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-white/30 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Data ditarik dari RPC{" "}
          <code className="font-mono text-white/45">admin_list_curated_routes</code>{" "}
          dan hanya dapat diubah akun Owner.
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

      {formOpen && (
        <RouteFormModal
          key={editing?.id ?? "new"}
          route={editing}
          onClose={closeForm}
          onSave={saveRoute}
          notify={notify}
        />
      )}
    </div>
  );
}
