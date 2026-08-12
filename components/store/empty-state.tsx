import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionHref = "/shop",
  actionLabel = "Browse the shop",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 h-px w-16 bg-[var(--color-rose-gold)]" />
      <h2 className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-espresso)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-espresso)]/70">
          {description}
        </p>
      ) : null}
      {actionHref && actionLabel ? (
        <Button asChild className="mt-8">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
