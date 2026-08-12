"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/store";
import {
  calculateOrderTotals,
  formatINRFromPaise,
} from "@/lib/utils/money";
import { FreeShippingProgress } from "@/components/store/free-shipping-progress";
import { EmptyState } from "@/components/store/empty-state";
import { Button } from "@/components/ui/button";

export function CartView() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotalInPaise = useCartStore((s) => s.subtotalInPaise());
  const totals = calculateOrderTotals({ subtotalInPaise });

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Discover jewellery crafted for every you — start with new arrivals or best sellers."
        actionHref="/shop"
        actionLabel="Continue shopping"
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-[family-name:var(--font-heading)] text-4xl text-[var(--color-espresso)]">
        Your bag
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y divide-[var(--color-champagne)]/70 border-y border-[var(--color-champagne)]/70">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-6">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden bg-[var(--color-champagne)]/30"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-[family-name:var(--font-heading)] text-xl hover:text-[var(--color-rose-gold)]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-[var(--color-espresso)]/60">
                      {item.variantName}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatINRFromPaise(item.unitPriceInPaise * item.quantity)}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <div className="flex items-center border border-[var(--color-champagne)]">
                    <button
                      type="button"
                      className="h-9 w-9"
                      onClick={() =>
                        setQuantity(item.variantId, item.quantity - 1)
                      }
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="h-9 w-9"
                      onClick={() =>
                        setQuantity(item.variantId, item.quantity + 1)
                      }
                      aria-label="Increase"
                      disabled={item.quantity >= item.maxQuantity}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-[var(--color-espresso)]/55 underline-offset-2 hover:underline"
                    onClick={() => removeItem(item.variantId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <FreeShippingProgress subtotalInPaise={subtotalInPaise} />
          <div className="space-y-2 border border-[var(--color-champagne)] bg-white/60 p-5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINRFromPaise(totals.subtotalInPaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {totals.shippingInPaise === 0
                  ? "FREE"
                  : formatINRFromPaise(totals.shippingInPaise)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-champagne)]/60 pt-3 text-base font-medium">
              <span>Total</span>
              <span>{formatINRFromPaise(totals.totalInPaise)}</span>
            </div>
          </div>
          <Button asChild className="hidden w-full lg:inline-flex" size="lg">
            <Link href="/checkout">Checkout via WhatsApp</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-champagne)] bg-[var(--color-ivory)]/95 p-4 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--color-espresso)]/60">Total</p>
            <p className="font-medium">
              {formatINRFromPaise(totals.totalInPaise)}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>
      <div className="h-24 lg:hidden" />
    </div>
  );
}
