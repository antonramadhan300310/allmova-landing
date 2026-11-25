import { statusLabels, type UserStatus } from "@/lib/admin";

const styles: Record<UserStatus, string> = {
  owner: "border-amber-300/35 bg-amber-300/10 text-amber-200",
  pro: "border-lime/35 bg-lime/10 text-lime",
  trial: "border-sky-400/35 bg-sky-400/10 text-sky-200",
  expired: "border-white/10 bg-white/[0.04] text-white/40",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: UserStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.08em] ${styles[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
