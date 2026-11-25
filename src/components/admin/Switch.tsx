"use client";

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
        checked
          ? "border-lime/60 bg-lime/80"
          : "border-white/15 bg-white/[0.08]"
      }`}
    >
      <span
        className={`absolute h-4 w-4 rounded-full bg-charcoal transition-transform ${
          checked ? "translate-x-[26px]" : "translate-x-[4px]"
        }`}
      />
    </button>
  );
}
