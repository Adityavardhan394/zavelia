"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { useCartStore } from "@/lib/cart/store";
import {
  checkoutAddressSchema,
  createOrderSchema,
} from "@/lib/validations";
import {
  calculateOrderTotals,
  formatINRFromPaise,
} from "@/lib/utils/money";
import { FreeShippingProgress } from "@/components/store/free-shipping-progress";
import { EmptyState } from "@/components/store/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AddressForm = z.infer<typeof checkoutAddressSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotalInPaise = useCartStore((s) => s.subtotalInPaise());
  const totals = calculateOrderTotals({ subtotalInPaise });
  const [submitting, setSubmitting] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const idempotencyKey = useRef<string>("");

  useEffect(() => {
    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }
  }, []);

  const form = useForm<AddressForm>({
    // zodResolver typing can disagree with z.default("India") inference
    resolver: zodResolver(checkoutAddressSchema) as never,
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      customerNotes: "",
    },
  });

  const linePreview = useMemo(
    () =>
      items.map((i) => ({
        name: i.name,
        qty: i.quantity,
        total: formatINRFromPaise(i.unitPriceInPaise * i.quantity),
      })),
    [items],
  );

  if (items.length === 0 && !fallbackUrl) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Add a few pieces to your bag, then return here to place your WhatsApp order."
      />
    );
  }

  async function onSubmit(values: AddressForm) {
    setSubmitting(true);
    setFallbackUrl(null);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        address: values,
        idempotencyKey: idempotencyKey.current || crypto.randomUUID(),
      };

      const parsed = createOrderSchema.safeParse(payload);
      if (!parsed.success) {
        toast.error("Please check your details and try again.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json?.error?.message ?? "Could not create order");
        setSubmitting(false);
        return;
      }

      const data = json.data as {
        orderNumber: string;
        publicToken: string;
        whatsappUrl: string;
      };

      const opened = window.open(data.whatsappUrl, "_blank");
      if (!opened) {
        setFallbackUrl(data.whatsappUrl);
        toast.message("Popup blocked — use Open WhatsApp below.");
      }

      clear();
      router.push(
        `/order/${data.orderNumber}?token=${data.publicToken}`,
      );
    } catch {
      toast.error("Something went wrong. Your form was preserved.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-[family-name:var(--font-heading)] text-4xl">
        Checkout
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-espresso)]/70">
        Share your delivery details. We&apos;ll open WhatsApp with your order
        summary so you can confirm with ZAVÉLIA.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <Field
            label="Full name"
            error={form.formState.errors.fullName?.message}
          >
            <Input {...form.register("fullName")} autoComplete="name" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Phone"
              error={form.formState.errors.phone?.message}
            >
              <Input
                {...form.register("phone")}
                inputMode="numeric"
                placeholder="10-digit mobile"
                autoComplete="tel"
              />
            </Field>
            <Field
              label="Email (optional)"
              error={form.formState.errors.email?.message}
            >
              <Input
                type="email"
                {...form.register("email")}
                autoComplete="email"
              />
            </Field>
          </div>
          <Field
            label="Address line 1"
            error={form.formState.errors.addressLine1?.message}
          >
            <Input
              {...form.register("addressLine1")}
              autoComplete="address-line1"
            />
          </Field>
          <Field
            label="Address line 2"
            error={form.formState.errors.addressLine2?.message}
          >
            <Input
              {...form.register("addressLine2")}
              autoComplete="address-line2"
            />
          </Field>
          <Field
            label="Landmark"
            error={form.formState.errors.landmark?.message}
          >
            <Input {...form.register("landmark")} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="City" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} autoComplete="address-level2" />
            </Field>
            <Field label="State" error={form.formState.errors.state?.message}>
              <Input
                {...form.register("state")}
                autoComplete="address-level1"
              />
            </Field>
            <Field
              label="PIN code"
              error={form.formState.errors.postalCode?.message}
            >
              <Input
                {...form.register("postalCode")}
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </Field>
          </div>
          <Field
            label="Order notes"
            error={form.formState.errors.customerNotes?.message}
          >
            <Textarea
              {...form.register("customerNotes")}
              placeholder="Gift note, preferred delivery window…"
            />
          </Field>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 accent-[var(--color-rose-gold)]"
              checked={form.watch("acceptTerms") === true}
              onChange={(e) =>
                form.setValue(
                  "acceptTerms",
                  e.target.checked ? true : (undefined as unknown as true),
                  { shouldValidate: true },
                )
              }
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {form.formState.errors.acceptTerms ? (
            <p className="text-sm text-[var(--color-error)]">
              {form.formState.errors.acceptTerms.message}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Placing order…" : "Place order & open WhatsApp"}
          </Button>

          {fallbackUrl ? (
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <a href={fallbackUrl} target="_blank" rel="noopener noreferrer">
                Open WhatsApp
              </a>
            </Button>
          ) : null}
        </form>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <FreeShippingProgress subtotalInPaise={subtotalInPaise} />
          <div className="space-y-3 border border-[var(--color-champagne)] bg-white/60 p-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl">
              Order summary
            </h2>
            <ul className="space-y-2 text-sm">
              {linePreview.map((line) => (
                <li key={line.name + line.qty} className="flex justify-between gap-3">
                  <span className="text-[var(--color-espresso)]/75">
                    {line.name} × {line.qty}
                  </span>
                  <span>{line.total}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-[var(--color-champagne)]/60 pt-3 text-sm">
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
              <div className="flex justify-between pt-1 text-base font-medium">
                <span>Total</span>
                <span>{formatINRFromPaise(totals.totalInPaise)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      ) : null}
    </div>
  );
}
