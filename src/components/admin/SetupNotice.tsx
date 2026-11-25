import { ArrowUpRight, KeyRound, Terminal } from "lucide-react";
import { SUPABASE_ANON_KEY_PLACEHOLDER } from "@/config/supabase";

export function SetupNotice() {
  return (
    <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-amber-200">
          <KeyRound className="h-4 w-4" strokeWidth={2.3} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-amber-100">
            Anon public key Supabase belum dipasang
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-amber-100/70">
            Buka{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[11.5px] text-amber-100">
              src/config/supabase.ts
            </code>{" "}
            lalu ganti{" "}
            <code className="inline-block max-w-full break-all rounded bg-black/30 px-1.5 py-0.5 align-bottom font-mono text-[11.5px] text-amber-100">
              &quot;{SUPABASE_ANON_KEY_PLACEHOLDER}&quot;
            </code>{" "}
            dengan anon public key (Supabase → Project Settings → API). Kunci ini
            aman dipublikasikan karena data dilindungi RLS dan RPC khusus Owner.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href="https://supabase.com/dashboard/project/adnboduimzesbvbejdwr/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[11.5px] font-bold text-amber-100 transition-colors hover:bg-amber-300/20"
            >
              Buka Supabase API Settings
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </a>
            <span className="flex items-start gap-1.5 text-[11.5px] font-medium leading-relaxed text-amber-100/50">
              <Terminal
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                strokeWidth={2.2}
              />
              <span>
                Butuh RPC: admin_list_users, admin_update_subscription,
                admin_reset_device_session
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
