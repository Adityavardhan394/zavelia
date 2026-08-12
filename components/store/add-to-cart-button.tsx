"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { useCartStore, type CartItem } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type AddToCartButtonProps = {
  item: Omit<CartItem, "quantity"> & { quantity?: number };
  className?: string;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "outline" | "ghost";
};

export function AddToCartButton({
  item,
  className,
  label = "Add to bag",
  size = "default",
  variant = "default",
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [busy, setBusy] = useState(false);

  function handleAdd() {
    if (item.maxQuantity < 1) {
      toast.error("This piece is currently out of stock.");
      return;
    }
    setBusy(true);
    addItem({
      ...item,
      quantity: item.quantity ?? 1,
    });
    toast.success(`${item.name} added to your bag`);
    setTimeout(() => setBusy(false), 350);
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(className)}
      disabled={busy || item.maxQuantity < 1}
      onClick={handleAdd}
    >
      <ShoppingBag className="h-4 w-4" />
      {item.maxQuantity < 1 ? "Out of stock" : label}
    </Button>
  );
}
