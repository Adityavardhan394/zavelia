"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart/store";
import {
  availableStock,
  isLowStock,
  isOutOfStock,
} from "@/lib/utils/stock";
import { formatINRFromPaise } from "@/lib/utils/money";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PriceDisplay } from "@/components/store/price-display";
import { cn } from "@/lib/utils/cn";

type Variant = {
  id: string;
  name: string;
  value: string;
  sku: string;
  priceAdjustmentInPaise: number;
  stockOnHand: number;
  stockReserved: number;
  lowStockThreshold: number;
  isActive: boolean;
};

type ProductPurchaseProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    priceInPaise: number;
    compareAtPriceInPaise?: number | null;
    shortDescription?: string | null;
    careInstructions?: string | null;
    material?: string | null;
    images: Array<{ url: string; isPrimary?: boolean }>;
    variants: Variant[];
  };
};

export function ProductPurchase({ product }: ProductPurchaseProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const variants = product.variants.filter((v) => v.isActive);
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variantId, variants],
  );

  const stock = selected
    ? availableStock(selected.stockOnHand, selected.stockReserved)
    : 0;
  const out = selected
    ? isOutOfStock(selected.stockOnHand, selected.stockReserved)
    : true;
  const low =
    selected &&
    isLowStock(
      selected.stockOnHand,
      selected.stockReserved,
      selected.lowStockThreshold,
    );
  const unitPrice =
    product.priceInPaise + (selected?.priceAdjustmentInPaise ?? 0);
  const primaryImage =
    product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;

  function addToCart() {
    if (!selected || out) {
      toast.error("This variant is unavailable.");
      return;
    }
    addItem({
      productId: product.id,
      variantId: selected.id,
      name: product.name,
      slug: product.slug,
      sku: selected.sku,
      variantName: `${selected.name}: ${selected.value}`,
      imageUrl: primaryImage,
      unitPriceInPaise: unitPrice,
      quantity: qty,
      maxQuantity: stock,
    });
    toast.success("Added to your bag");
  }

  function buyWhatsApp() {
    if (!selected || out) return;
    addToCart();
    router.push("/checkout");
  }

  const variantNames = Array.from(new Set(variants.map((v) => v.name)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-espresso)] sm:text-4xl">
          {product.name}
        </h1>
        {product.shortDescription ? (
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-espresso)]/70">
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-4">
          <PriceDisplay
            priceInPaise={unitPrice}
            compareAtPriceInPaise={
              selected && selected.priceAdjustmentInPaise === 0
                ? product.compareAtPriceInPaise
                : null
            }
            size="lg"
          />
        </div>
      </div>

      {variantNames.map((name) => {
        const options = variants.filter((v) => v.name === name);
        return (
          <div key={name} className="space-y-2">
            <Label>
              {name}
              {selected && selected.name === name
                ? `: ${selected.value}`
                : ""}
            </Label>
            <div className="flex flex-wrap gap-2">
              {options.map((v) => {
                const vOut = isOutOfStock(v.stockOnHand, v.stockReserved);
                const active = selected?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={vOut}
                    onClick={() => {
                      setVariantId(v.id);
                      setQty(1);
                    }}
                    className={cn(
                      "min-w-12 border px-3 py-2 text-sm transition",
                      active
                        ? "border-[var(--color-espresso)] bg-[var(--color-espresso)] text-white"
                        : "border-[var(--color-champagne)] bg-white hover:border-[var(--color-rose-gold)]",
                      vOut && "cursor-not-allowed opacity-40 line-through",
                    )}
                  >
                    {v.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="space-y-2">
        <Label htmlFor="qty">Quantity</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-11 w-11 border border-[var(--color-champagne)] bg-white"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="qty"
            type="number"
            min={1}
            max={Math.max(1, stock)}
            value={qty}
            onChange={(e) =>
              setQty(
                Math.min(Math.max(1, Number(e.target.value) || 1), Math.max(1, stock)),
              )
            }
            className="h-11 w-16 border border-[var(--color-champagne)] bg-white text-center"
          />
          <button
            type="button"
            className="h-11 w-11 border border-[var(--color-champagne)] bg-white"
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            aria-label="Increase quantity"
            disabled={qty >= stock}
          >
            +
          </button>
        </div>
        {out ? (
          <p className="text-sm text-[var(--color-error)]">Out of stock</p>
        ) : low ? (
          <p className="text-sm text-[var(--color-rose-gold)]">
            Only {stock} left
          </p>
        ) : (
          <p className="text-sm text-[var(--color-espresso)]/55">
            {stock} available
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          className="flex-1"
          disabled={out}
          onClick={addToCart}
        >
          Add to bag — {formatINRFromPaise(unitPrice * qty)}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={out}
          onClick={buyWhatsApp}
        >
          <MessageCircle className="h-4 w-4" />
          Buy on WhatsApp
        </Button>
      </div>

      {(product.material || product.careInstructions) && (
        <div className="space-y-4 border-t border-[var(--color-champagne)]/70 pt-6 text-sm">
          {product.material ? (
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg">
                Material
              </h3>
              <p className="mt-1 text-[var(--color-espresso)]/75">
                {product.material}
              </p>
            </div>
          ) : null}
          {product.careInstructions ? (
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg">
                Care
              </h3>
              <p className="mt-1 whitespace-pre-line text-[var(--color-espresso)]/75">
                {product.careInstructions}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
