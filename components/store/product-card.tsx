"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { calculateDiscountPercent } from "@/lib/utils/money";
import { availableStock } from "@/lib/utils/stock";
import { cn } from "@/lib/utils/cn";
import { PriceDisplay } from "@/components/store/price-display";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

export type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  priceInPaise: number;
  compareAtPriceInPaise?: number | null;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  images: Array<{
    id: string;
    url: string;
    altText?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  variants: Array<{
    id: string;
    name: string;
    value: string;
    sku: string;
    priceAdjustmentInPaise: number;
    stockOnHand: number;
    stockReserved: number;
    isActive: boolean;
  }>;
};

type ProductCardProps = {
  product: ProductCardProduct;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const sorted = [...product.images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const primary = sorted.find((i) => i.isPrimary) ?? sorted[0] ?? null;
  const secondary = sorted.find((i) => i.id !== primary?.id) ?? null;
  const variant =
    product.variants.find((v) => v.isActive) ?? product.variants[0];
  const stock = variant
    ? availableStock(variant.stockOnHand, variant.stockReserved)
    : 0;
  const discount = calculateDiscountPercent(
    product.priceInPaise,
    product.compareAtPriceInPaise,
  );

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-champagne)]/35">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 block"
        >
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.altText || product.name}
              fill
              loading="lazy"
              quality={70}
              className={cn(
                "object-cover transition duration-500",
                secondary && "group-hover:opacity-0",
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <Image
                src="/brand/zavelia-logo.png"
                alt={product.name}
                width={120}
                height={40}
                className="opacity-40"
              />
            </div>
          )}
          {secondary ? (
            <Image
              src={secondary.url}
              alt={secondary.altText || `${product.name} alternate`}
              fill
              loading="lazy"
              quality={60}
              className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : null}
        </Link>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNewArrival ? (
            <span className="bg-[var(--color-espresso)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
              New
            </span>
          ) : null}
          {product.isBestSeller ? (
            <span className="bg-[var(--color-rose-gold)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
              Best seller
            </span>
          ) : null}
          {discount ? (
            <span className="bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[var(--color-error)]">
              −{discount}%
            </span>
          ) : null}
        </div>

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => {
            setWishlisted((v) => !v);
            toast.message(
              wishlisted ? "Removed from wishlist" : "Saved to wishlist",
            );
          }}
          className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--color-espresso)] shadow-sm transition hover:scale-105"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              wishlisted &&
                "fill-[var(--color-rose-gold)] text-[var(--color-rose-gold)]",
            )}
          />
        </button>

        {variant && stock > 0 ? (
          <div className="absolute inset-x-2 bottom-2 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <AddToCartButton
              size="sm"
              className="w-full shadow-md"
              label="Quick add"
              item={{
                productId: product.id,
                variantId: variant.id,
                name: product.name,
                slug: product.slug,
                sku: variant.sku,
                variantName: `${variant.name}: ${variant.value}`,
                imageUrl: primary?.url,
                unitPriceInPaise:
                  product.priceInPaise + variant.priceAdjustmentInPaise,
                maxQuantity: stock,
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-3 space-y-1 px-0.5">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 font-[family-name:var(--font-heading)] text-lg leading-snug text-[var(--color-espresso)] transition hover:text-[var(--color-rose-gold)]"
        >
          {product.name}
        </Link>
        <PriceDisplay
          priceInPaise={product.priceInPaise}
          compareAtPriceInPaise={product.compareAtPriceInPaise}
          size="sm"
        />
        {stock <= 0 ? (
          <p className="text-xs text-[var(--color-error)]">Out of stock</p>
        ) : null}
      </div>
    </article>
  );
}
