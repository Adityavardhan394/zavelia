import { cn } from "@/lib/utils/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "danger" | "success";
  className?: string;
};

const toneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-[var(--admin-border)]",
  warning: "border-[var(--color-warning)]/40",
  danger: "border-[var(--color-error)]/40",
  success: "border-[var(--color-success)]/40",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "admin-card flex flex-col gap-1 p-4 shadow-sm",
        toneClass[tone],
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-espresso)]/60">
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums text-[var(--color-espresso)]">
        {value}
      </p>
      {hint ? (
        <p className="text-xs text-[var(--color-espresso)]/55">{hint}</p>
      ) : null}
    </div>
  );
}
