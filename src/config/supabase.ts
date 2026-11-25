import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://adnboduimzesbvbejdwr.supabase.co";

/**
 * Tempelkan "anon public key" Supabase di sini (atau lewat env
 * NEXT_PUBLIC_SUPABASE_ANON_KEY di Vercel). Nilai ini memang publik —
 * keamanan data tetap dijaga oleh RLS + fungsi RPC yang hanya mengizinkan Owner.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "PASTE_SUPABASE_ANON_KEY_DISINI";

export const SUPABASE_ANON_KEY_PLACEHOLDER = "PASTE_SUPABASE_ANON_KEY_DISINI";

/** True bila anon key sudah diisi (bukan placeholder bawaan). */
export const isSupabaseConfigured =
  SUPABASE_ANON_KEY.trim().length > 0 &&
  SUPABASE_ANON_KEY.trim() !== SUPABASE_ANON_KEY_PLACEHOLDER;

let client: SupabaseClient | null = null;

/**
 * Client Supabase untuk halaman /admin.
 * Mengembalikan null bila anon key belum diisi, agar UI bisa menampilkan
 * banner instruksi alih-alih gagal dengan error jaringan.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
