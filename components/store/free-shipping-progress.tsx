"use client";

import {
  FREE_SHIPPING_THRESHOLD_PAISE,
  freeShippingProgress,
  formatINRFromPaise,
} from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

type FreeShippingProgressProps = {
  subtotalInPaise: number;
  className?: string;
};

export function FreeShippingProgress({
  subtotalInPaise,
  className,
}: FreeShippingProgressProps) {
  const progress = freeShippingProgress(subtotalInPaise);
  const pct = Math.min(
    100,
    Math.round((subtotalInPaise / FREE_SHIPPING_THRESHOLD_PAISE) * 100),
  );

  return (
    <div
      className={cn(
        "rounded-md border border-[var(--color-champagne)] bg-white/70 p-4",
        className,
      )}
    >
      <p className="text-sm text-[var(--color-espresso)]">{progress.message}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-champagne)]/50">
        <div
          className="h-full rounded-full bg-[var(--color-rose-gold)] transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Free shipping progress"
        />
      </div>
      {!progress.unlocked ? (
        <p className="mt-2 text-xs text-[var(--color-espresso)]/60">
          Threshold {formatINRFromPaise(FREE_SHIPPING_THRESHOLD_PAISE)}
        </p>
      ) : null}
    </div>
  );
}
