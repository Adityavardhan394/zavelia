import { formatINRFromPaise } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

type PriceDisplayProps = {
  priceInPaise: number;
  compareAtPriceInPaise?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function PriceDisplay({
  priceInPaise,
  compareAtPriceInPaise,
  className,
  size = "md",
}: PriceDisplayProps) {
  const onSale =
    compareAtPriceInPaise != null && compareAtPriceInPaise > priceInPaise;

  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-2",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl",
        className,
      )}
    >
      <span className="font-medium text-[var(--color-espresso)]">
        {formatINRFromPaise(priceInPaise)}
      </span>
      {onSale ? (
        <span className="text-sm text-[var(--color-espresso)]/45 line-through">
          {formatINRFromPaise(compareAtPriceInPaise)}
        </span>
      ) : null}
    </div>
  );
}
