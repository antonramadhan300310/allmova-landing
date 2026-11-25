"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FileUp,
  Loader2,
  MapPin,
  Route as RouteIcon,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { RouteShapePreview } from "@/components/admin/RouteShapePreview";
import { Switch } from "@/components/admin/Switch";
import { inputClass, labelClass } from "@/components/admin/styles";
import type { ToastKind } from "@/components/admin/Toast";
import {
  DIFFICULTIES,
  MAX_STORED_POINTS,
  SPORT_TYPES,
  difficultyLabels,
  formatDistanceKm,
  formatElevation,
  parseGpx,
  sportFilterLabels,
  type CuratedRoute,
  type CuratedRouteInput,
  type Difficulty,
  type RouteCoordinate,
  type SportType,
} from "@/lib/curatedRoutes";

type RouteFormModalProps = {
  route: CuratedRoute | null;
  onClose: () => void;
  onSave: (input: CuratedRouteInput) => Promise<string | null>;
  notify: (kind: ToastKind, message: string) => void;
};

function stripGpxExtension(fileName: string): string {
  return fileName.replace(/\.gpx$/i, "").replace(/[_-]+/g, " ").trim();
}

export function RouteFormModal({
  route,
  onClose,
  onSave,
  notify,
}: RouteFormModalProps) {
  const [name, setName] = useState(route?.name ?? "");
  const [city, setCity] = useState(route?.city ?? "");
  const [sportType, setSportType] = useState<SportType>(route?.sportType ?? "cycling");
  const [difficulty, setDifficulty] = useState<Difficulty>(route?.difficulty ?? "easy");
  const [description, setDescription] = useState(route?.description ?? "");
  const [isPro, setIsPro] = useState(route?.isPro ?? false);
  const [isActive, setIsActive] = useState(route?.isActive ?? true);
  const [coordinates, setCoordinates] = useState<RouteCoordinate[]>(
    route?.coordinates ?? [],
  );
  const [distanceKm, setDistanceKm] = useState(route?.distanceKm ?? 0);
  const [elevationGainM, setElevationGainM] = useState(route?.elevationGainM ?? 0);
  const [totalPoints, setTotalPoints] = useState(route?.coordinates.length ?? 0);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [gpxError, setGpxError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

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

  async function ingestFile(file: File) {
    if (busy) return;
    if (!/\.gpx$/i.test(file.name)) {
      setGpxError("Format file harus .gpx");
      return;
    }

    setParsing(true);
    setGpxError(null);

    try {
      const text = await file.text();
      const parsed = parseGpx(text, stripGpxExtension(file.name));
      setCoordinates(parsed.coordinates);
      setDistanceKm(parsed.distanceKm);
      setElevationGainM(parsed.elevationGainM);
      setTotalPoints(parsed.totalPoints);
      setFileName(file.name);
      if (parsed.name) {
        setName((current) => (current.trim() === "" ? parsed.name! : current));
      }
      notify(
        "success",
        `GPX dibaca: ${parsed.totalPoints} titik, ${formatDistanceKm(parsed.distanceKm)}.`,
      );
    } catch (error) {
      setGpxError(
        error instanceof Error ? error.message : "Gagal membaca file GPX.",
      );
    } finally {
      setParsing(false);
    }
  }

  function clearTrack() {
    setCoordinates([]);
    setDistanceKm(0);
    setElevationGainM(0);
    setTotalPoints(0);
    setFileName("");
    setGpxError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (name.trim() === "") {
      notify("error", "Nama rute wajib diisi.");
      nameRef.current?.focus();
      return;
    }

    setBusy(true);
    const error = await onSave({
      id: route?.id ?? null,
      name,
      city,
      sportType,
      distanceKm,
      elevationGainM,
      difficulty,
      description,
      isPro,
      isActive,
      coordinates,
    });
    setBusy(false);

    if (error) {
      notify("error", error);
      return;
    }

    notify(
      "success",
      route ? "Rute favorit berhasil diperbarui." : "Rute favorit baru berhasil disimpan.",
    );
    onClose();
  }

  const hasTrack = coordinates.length > 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Tutup dialog rute"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-form-title"
        tabIndex={-1}
        className="relative flex max-h-[94dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-t-[1.75rem] border border-hairline bg-charcoal shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.9)] outline-none sm:max-h-[90dvh] sm:rounded-3xl sm:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="eyebrow">{route ? "Edit Rute" : "Rute Baru"}</p>
            <h2
              id="route-form-title"
              className="mt-1.5 text-[15.5px] font-extrabold tracking-[-0.01em] text-white"
            >
              {route ? "Perbarui Rute Favorit" : "Tambah Rute Favorit"}
            </h2>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-white/40">
              Unggah GPX untuk mengisi jarak, elevasi, dan bentuk jalur otomatis.
            </p>
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

        <form
          id="route-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
        >
          <section aria-labelledby="gpx-upload-title">
            <h3
              id="gpx-upload-title"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45"
            >
              <RouteIcon className="h-3.5 w-3.5 text-lime" strokeWidth={2.4} />
              Jalur GPX
            </h3>

            <input
              ref={inputRef}
              type="file"
              accept=".gpx,application/gpx+xml"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void ingestFile(file);
              }}
            />

            {hasTrack ? (
              <div className="mt-2.5 overflow-hidden rounded-xl border border-lime/25 bg-[radial-gradient(ellipse_at_center,rgba(185,245,30,0.09),transparent_70%)]">
                <div className="border-b border-white/[0.06] px-2 py-1">
                  <RouteShapePreview coordinates={coordinates} className="h-32 w-full" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3">
                  <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <div>
                      <dt className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35">
                        Jarak
                      </dt>
                      <dd className="text-[12.5px] font-extrabold text-white">
                        {formatDistanceKm(distanceKm)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35">
                        Elevasi
                      </dt>
                      <dd className="text-[12.5px] font-extrabold text-white">
                        {formatElevation(elevationGainM)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35">
                        Titik
                      </dt>
                      <dd className="text-[12.5px] font-extrabold text-white">
                        {coordinates.length}
                        <span className="ml-1 text-[10px] font-medium text-white/35">
                          / {totalPoints} asli
                        </span>
                      </dd>
                    </div>
                  </dl>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={parsing || busy}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] px-3 text-[11px] font-bold text-white/70 transition-colors hover:border-lime/40 hover:text-lime disabled:opacity-45"
                    >
                      <FileUp className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={clearTrack}
                      disabled={busy}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-red-400/25 bg-red-400/[0.06] px-3 text-[11px] font-bold text-red-200/85 transition-colors hover:border-red-400/45 hover:bg-red-400/[0.12] disabled:opacity-45"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Hapus
                    </button>
                  </div>
                </div>
                {fileName && (
                  <p className="truncate border-t border-white/[0.06] px-3.5 py-1.5 text-[10.5px] font-medium text-white/30">
                    {fileName}
                    {totalPoints > MAX_STORED_POINTS &&
                      ` · disederhanakan ke ${MAX_STORED_POINTS} titik`}
                  </p>
                )}
              </div>
            ) : (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!parsing) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  const file = event.dataTransfer.files?.[0];
                  if (file) void ingestFile(file);
                }}
              >
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={parsing || busy}
                  className={`mt-2.5 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    dragging
                      ? "border-lime/60 bg-lime/[0.08]"
                      : "border-white/[0.14] bg-white/[0.015] hover:border-lime/40 hover:bg-lime/[0.04]"
                  }`}
                >
                  {parsing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-lime" strokeWidth={2.4} />
                  ) : (
                    <FileUp className="h-5 w-5 text-lime" strokeWidth={2.2} />
                  )}
                  <span className="text-[12.5px] font-bold text-white">
                    {parsing ? "Membaca file GPX…" : "Tarik & lepas file .gpx"}
                  </span>
                  <span className="text-[11px] font-medium text-white/35">
                    atau klik untuk memilih file dari perangkat
                  </span>
                </button>
              </div>
            )}

            {gpxError && (
              <p role="alert" className="mt-2 text-[11.5px] font-semibold text-red-300">
                {gpxError}
              </p>
            )}
          </section>

          <section aria-labelledby="route-meta-title" className="mt-5 border-t border-hairline pt-4">
            <h3
              id="route-meta-title"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45"
            >
              <MapPin className="h-3.5 w-3.5 text-lime" strokeWidth={2.4} />
              Metadata Rute
            </h3>

            <div className="mt-3 grid gap-3">
              <div>
                <label htmlFor="route-name" className={labelClass}>
                  Nama Rute <span className="text-lime">*</span>
                </label>
                <input
                  id="route-name"
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: Lembang – Tangkuban Perahu"
                  disabled={busy}
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="route-city" className={labelClass}>
                    Kota / Area
                  </label>
                  <input
                    id="route-city"
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Contoh: Bandung"
                    disabled={busy}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="route-sport" className={labelClass}>
                    Tipe Olahraga <span className="text-lime">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="route-sport"
                      value={sportType}
                      onChange={(event) => setSportType(event.target.value as SportType)}
                      disabled={busy}
                      required
                      className={`${inputClass} appearance-none pr-9 [&>option]:bg-charcoal [&>option]:text-white`}
                    >
                      {SPORT_TYPES.map((sport) => (
                        <option key={sport} value={sport}>
                          {sportFilterLabels[sport]}
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
              </div>

              <div>
                <label htmlFor="route-difficulty" className={labelClass}>
                  Tingkat Kesulitan
                </label>
                <div className="relative">
                  <select
                    id="route-difficulty"
                    value={difficulty}
                    onChange={(event) =>
                      setDifficulty(event.target.value as Difficulty)
                    }
                    disabled={busy}
                    className={`${inputClass} appearance-none pr-9 [&>option]:bg-charcoal [&>option]:text-white`}
                  >
                    {DIFFICULTIES.map((level) => (
                      <option key={level} value={level}>
                        {difficultyLabels[level]} · {level}
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
                <label htmlFor="route-description" className={labelClass}>
                  Catatan Singkat / Deskripsi
                </label>
                <textarea
                  id="route-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Deskripsi singkat rute, kondisi jalan, atau tips untuk pengguna."
                  disabled={busy}
                  rows={3}
                  maxLength={400}
                  className={`${inputClass} h-auto min-h-[84px] resize-y py-2.5 leading-relaxed`}
                />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-white/[0.02] px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-white">Khusus PRO</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">
                    Hanya terbuka untuk pengguna Pro.
                  </p>
                </div>
                <Switch
                  checked={isPro}
                  onChange={setIsPro}
                  disabled={busy}
                  label="Tandai rute khusus PRO"
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-white/[0.02] px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-white">Aktif / Tayang</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">
                    Tampil di daftar rute favorit aplikasi.
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onChange={setIsActive}
                  disabled={busy}
                  label="Tayangkan rute di aplikasi"
                />
              </div>
            </div>
          </section>
        </form>

        <div className="flex shrink-0 items-center gap-2 border-t border-hairline bg-charcoal px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-ghost h-11 px-4 text-[12.5px] disabled:opacity-45"
          >
            Batal
          </button>
          <button
            type="submit"
            form="route-form"
            disabled={busy || parsing}
            className="btn-lime h-11 flex-1 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:shadow-none"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
                Menyimpan…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={2.4} />
                Simpan Rute
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
