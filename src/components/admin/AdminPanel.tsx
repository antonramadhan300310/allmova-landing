"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { SetupNotice } from "@/components/admin/SetupNotice";
import {
  ToastViewport,
  type ToastKind,
  type ToastMessage,
} from "@/components/admin/Toast";
import { Logo } from "@/components/Logo";
import { getSupabaseClient, isSupabaseConfigured } from "@/config/supabase";
import {
  describeRpcError,
  isSessionExpiredError,
  isUnauthorizedError,
  mapAuthErrorMessage,
  normalizeAdminUsers,
  type AdminUser,
  type SubscriptionPatch,
} from "@/lib/admin";

export function AdminPanel() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [booting, setBooting] = useState(isSupabaseConfigured);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      toastId.current += 1;
      const id = toastId.current;
      setToasts((current) => [...current.slice(-2), { id, kind, message }]);
      window.setTimeout(() => dismissToast(id), 4800);
    },
    [dismissToast],
  );

  const handleAuthFailure = useCallback(
    (kind: "unauthorized" | "expired") => {
      if (kind === "unauthorized") {
        setAccessDenied(true);
        return;
      }
      setSessionEmail(null);
      setSessionUserId(null);
      setUsers([]);
      setAccessDenied(false);
      setListError(null);
      void getSupabaseClient()?.auth.signOut();
      notify("error", "Sesi login berakhir. Silakan masuk kembali.");
    },
    [notify],
  );

  const loadUsers = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setLoadingUsers(true);
    setListError(null);

    try {
      const { data, error } = await supabase.rpc("admin_list_users");

      if (error) {
        if (isUnauthorizedError(error)) {
          setAccessDenied(true);
          setUsers([]);
          return;
        }
        if (isSessionExpiredError(error)) {
          setSessionEmail(null);
          setUsers([]);
          setAccessDenied(false);
          void supabase.auth.signOut();
          notify("error", "Sesi login berakhir. Silakan masuk kembali.");
          return;
        }
        const message = describeRpcError(error.message);
        setListError(message);
        notify("error", `Gagal memuat pengguna: ${message}`);
        return;
      }

      setAccessDenied(false);
      setUsers(normalizeAdminUsers(data));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tak terduga saat memuat pengguna.";
      setListError(message);
      notify("error", message);
    } finally {
      setLoadingUsers(false);
    }
  }, [notify]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let active = true;

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        const email = data.session?.user.email ?? null;
        setSessionEmail(email);
        setSessionUserId(data.session?.user.id ?? null);
        setBooting(false);
        if (email) await loadUsers();
      } catch {
        if (active) setBooting(false);
      }
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setSessionEmail(null);
          setSessionUserId(null);
          setUsers([]);
          setAccessDenied(false);
          setListError(null);
        } else if (session?.user.email) {
          setSessionEmail(session.user.email);
          setSessionUserId(session.user.id);
        }
      },
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadUsers]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return "Supabase belum dikonfigurasi. Tempelkan anon public key terlebih dahulu.";
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) return mapAuthErrorMessage(error.message);

        setSessionEmail(data.user?.email ?? email);
        setSessionUserId(data.user?.id ?? null);
        await loadUsers();
        return null;
      } catch (error) {
        return error instanceof Error
          ? mapAuthErrorMessage(error.message)
          : "Gagal masuk. Periksa koneksi lalu coba lagi.";
      }
    },
    [loadUsers],
  );

  const signOut = useCallback(() => {
    setSessionEmail(null);
    setSessionUserId(null);
    setUsers([]);
    setAccessDenied(false);
    setListError(null);
    setToasts([]);
    void getSupabaseClient()?.auth.signOut();
  }, []);

  const updateSubscription = useCallback(
    async (
      userId: string,
      patch: SubscriptionPatch,
    ): Promise<string | null> => {
      const supabase = getSupabaseClient();
      if (!supabase) return "Supabase belum dikonfigurasi.";

      const { error } = await supabase.rpc("admin_update_subscription", {
        p_user_id: userId,
        p_tier: patch.tier,
        p_pro_expires_at: patch.proExpiresAt,
        p_is_owner: patch.isOwner,
        p_source: "manual_admin",
      });

      if (error) {
        if (isUnauthorizedError(error)) setAccessDenied(true);
        return describeRpcError(error.message);
      }

      await loadUsers();
      return null;
    },
    [loadUsers],
  );

  const resetDevice = useCallback(
    async (userId: string): Promise<string | null> => {
      const supabase = getSupabaseClient();
      if (!supabase) return "Supabase belum dikonfigurasi.";

      const { error } = await supabase.rpc("admin_reset_device_session", {
        p_user_id: userId,
      });

      if (error) {
        if (isUnauthorizedError(error)) setAccessDenied(true);
        return describeRpcError(error.message);
      }

      await loadUsers();
      return null;
    },
    [loadUsers],
  );

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="inline-flex items-center gap-2.5 text-[12.5px] font-semibold text-white/40">
          <Loader2 className="h-4 w-4 animate-spin text-lime" strokeWidth={2.4} />
          Memeriksa sesi admin…
        </span>
      </div>
    );
  }

  if (!sessionEmail) {
    return (
      <div className="relative min-h-screen">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-faint bg-[size:64px_64px] opacity-50 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_72%)]" />
          <div className="absolute -top-40 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(185,245,30,0.13),transparent_65%)] blur-3xl" />
        </div>

        <AdminLogin
          onSubmit={signIn}
          disabled={!isSupabaseConfigured}
          notice={!isSupabaseConfigured ? <SetupNotice /> : null}
        />
      </div>
    );
  }

  if (accessDenied) {
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

        <main className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-[440px] rounded-2xl border border-red-400/25 bg-red-400/[0.05] p-6 text-center">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/30 bg-red-400/10 text-red-200">
              <ShieldAlert className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <h1 className="mt-4 text-[17px] font-extrabold leading-snug tracking-[-0.01em] text-white">
              Akses Ditolak: Akun ini bukan Owner ALLMOVA
            </h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
              Anda masuk sebagai{" "}
              <span className="font-semibold text-white/75">{sessionEmail}</span>.
              Panel ini hanya dapat dibuka oleh akun Owner. Silakan keluar lalu
              masuk kembali dengan akun Owner.
            </p>
            <button
              type="button"
              onClick={signOut}
              className="btn-lime mt-5 h-11 w-full text-[13px]"
            >
              Keluar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <AdminDashboard
        email={sessionEmail}
        userId={sessionUserId}
        users={users}
        loading={loadingUsers}
        listError={listError}
        onRefresh={() => void loadUsers()}
        onSignOut={signOut}
        onUpdateSubscription={updateSubscription}
        onResetDevice={resetDevice}
        onAuthFailure={handleAuthFailure}
        notify={notify}
      />
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
