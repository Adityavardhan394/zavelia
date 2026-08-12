"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  sku: string;
  variantName: string;
  imageUrl?: string | null;
  unitPriceInPaise: number;
  quantity: number;
  maxQuantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  subtotalInPaise: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.maxQuantity,
                        i.quantity + item.quantity,
                      ),
                      unitPriceInPaise: item.unitPriceInPaise,
                      maxQuantity: item.maxQuantity,
                    }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.variantId === variantId
                ? {
                    ...i,
                    quantity: Math.min(i.maxQuantity, Math.max(1, quantity)),
                  }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      subtotalInPaise: () =>
        get().items.reduce(
          (sum, item) => sum + item.unitPriceInPaise * item.quantity,
          0,
        ),
      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "zavelia-cart",
    },
  ),
);
