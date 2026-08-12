import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/store/product-card";
import { cn } from "@/lib/utils/cn";

type ProductGridProps = {
  products: ProductCardProduct[];
  className?: string;
};

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-[var(--color-champagne)]/40" />
          <div className="mt-3 h-4 w-3/4 rounded bg-[var(--color-champagne)]/50" />
          <div className="mt-2 h-3 w-1/3 rounded bg-[var(--color-champagne)]/40" />
        </div>
      ))}
    </div>
  );
}
