"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable } from "@/components/admin/data-table";
import { adminFetch, AdminApiError } from "@/lib/admin/fetch";
import { formatINRFromPaise } from "@/lib/utils/money";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp/message";

const ORDER_STATUSES = [
  "WHATSAPP_PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const PAYMENT_STATUSES = [
  "UNPAID",
  "COD_PENDING",
  "PAID",
  "REFUNDED",
] as const;

type AddressSnapshot = {
  fullName?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  publicToken: string;
  status: (typeof ORDER_STATUSES)[number];
  paymentStatus: (typeof PAYMENT_STATUSES)[number];
  subtotalInPaise: number;
  discountInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  customerNotes: string | null;
  adminNotes: string | null;
  stockReservationExpiresAt: string | Date | null;
  stockReleasedAt: string | Date | null;
  whatsappOpenedAt: string | Date | null;
  createdAt: string | Date;
  shippingAddressSnapshot: AddressSnapshot;
  customer: { id: string; name: string; phone: string; email: string | null };
  items: Array<{
    id: string;
    productName: string;
    sku: string;
    variantName: string;
    quantity: number;
    unitPriceInPaise: number;
    lineTotalInPaise: number;
  }>;
};

type OrderDetailClientProps = {
  order: OrderDetail;
  whatsappNumber: string;
  siteUrl: string;
};

export function OrderDetailClient({
  order,
  whatsappNumber,
  siteUrl,
}: OrderDetailClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [adminNotes, setAdminNotes] = useState(order.adminNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | "release" | null>(null);

  const address = order.shippingAddressSnapshot ?? {};
  const addressLines = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean) as string[];

  const waMessage = buildWhatsAppMessage({
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    phone: order.customer.phone,
    addressLines,
    items: order.items,
    subtotalInPaise: order.subtotalInPaise,
    discountInPaise: order.discountInPaise,
    shippingInPaise: order.shippingInPaise,
    totalInPaise: order.totalInPaise,
    customerNotes: order.customerNotes,
    orderUrl: `${siteUrl}/order/${order.publicToken}`,
  });
  const waUrl = whatsappNumber
    ? buildWhatsAppUrl(whatsappNumber, waMessage)
    : null;

  async function saveStatus() {
    setBusy(true);
    setError(null);
    try {
      if (status === "CANCELLED" && order.status !== "CANCELLED") {
        setConfirm("cancel");
        setBusy(false);
        return;
      }
      await adminFetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes }),
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function savePayment() {
    setBusy(true);
    setError(null);
    try {
      await adminFetch(`/api/admin/orders/${order.id}/payment-status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus }),
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmAction() {
    setBusy(true);
    setError(null);
    try {
      if (confirm === "release") {
        await adminFetch(`/api/admin/orders/${order.id}/release-stock`, {
          method: "POST",
          body: JSON.stringify({ reason: "Manual release by admin" }),
        });
      } else if (confirm === "cancel") {
        await adminFetch(`/api/admin/orders/${order.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "CANCELLED", adminNotes }),
        });
        setStatus("CANCELLED");
      }
      setConfirm(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-md border border-[var(--color-error)]/25 bg-[var(--color-error)]/5 px-3 py-2 text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      <div className="admin-no-print flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="admin-brand text-2xl">{order.orderNumber}</h2>
          <p className="text-sm text-[var(--color-espresso)]/55">
            Created {format(new Date(order.createdAt), "dd MMM yyyy HH:mm")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {waUrl ? (
            <Button asChild variant="secondary">
              <a href={waUrl} target="_blank" rel="noreferrer">
                Open WhatsApp
              </a>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print summary
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!!order.stockReleasedAt}
            onClick={() => setConfirm("release")}
          >
            Release stock
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="admin-card space-y-2 p-4 lg:col-span-2">
          <h3 className="admin-brand text-lg">Items</h3>
          <DataTable
            rows={order.items}
            rowKey={(i) => i.id}
            columns={[
              {
                key: "product",
                header: "Product",
                render: (i) => (
                  <div>
                    <p className="font-medium">{i.productName}</p>
                    <p className="text-xs text-[var(--color-espresso)]/50">
                      {i.variantName} · {i.sku}
                    </p>
                  </div>
                ),
              },
              { key: "qty", header: "Qty", render: (i) => i.quantity },
              {
                key: "unit",
                header: "Unit",
                render: (i) => formatINRFromPaise(i.unitPriceInPaise),
              },
              {
                key: "line",
                header: "Line total",
                render: (i) => formatINRFromPaise(i.lineTotalInPaise),
              },
            ]}
          />
          <div className="space-y-1 border-t border-[var(--admin-border)] pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINRFromPaise(order.subtotalInPaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>{formatINRFromPaise(order.discountInPaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {order.shippingInPaise === 0
                  ? "FREE"
                  : formatINRFromPaise(order.shippingInPaise)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatINRFromPaise(order.totalInPaise)}</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="admin-card space-y-3 p-4">
            <h3 className="admin-brand text-lg">Customer</h3>
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-sm">{order.customer.phone}</p>
            {order.customer.email ? (
              <p className="text-sm">{order.customer.email}</p>
            ) : null}
            <div className="text-sm text-[var(--color-espresso)]/75">
              <p className="mb-1 font-medium text-[var(--color-espresso)]">
                Shipping
              </p>
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            {order.customerNotes ? (
              <p className="text-sm">
                <span className="font-medium">Customer notes: </span>
                {order.customerNotes}
              </p>
            ) : null}
          </div>

          <div className="admin-card admin-no-print space-y-3 p-4">
            <h3 className="admin-brand text-lg">Update</h3>
            <div className="space-y-1.5">
              <Label htmlFor="status">Order status</Label>
              <select
                id="status"
                className="flex h-11 w-full rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as (typeof ORDER_STATUSES)[number])
                }
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" onClick={saveStatus} disabled={busy}>
              Save status
            </Button>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="payment">Payment status</Label>
              <select
                id="payment"
                className="flex h-11 w-full rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(
                    e.target.value as (typeof PAYMENT_STATUSES)[number],
                  )
                }
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={savePayment}
              disabled={busy}
            >
              Save payment
            </Button>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="notes">Admin notes</Label>
              <Textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-card space-y-1 p-4 text-sm">
            <h3 className="admin-brand text-lg">Reservation</h3>
            <p>
              Expires:{" "}
              {order.stockReservationExpiresAt
                ? format(
                    new Date(order.stockReservationExpiresAt),
                    "dd MMM yyyy HH:mm",
                  )
                : "—"}
            </p>
            <p>
              Released:{" "}
              {order.stockReleasedAt
                ? format(new Date(order.stockReleasedAt), "dd MMM yyyy HH:mm")
                : "Not released"}
            </p>
            <p>
              WhatsApp opened:{" "}
              {order.whatsappOpenedAt
                ? format(new Date(order.whatsappOpenedAt), "dd MMM yyyy HH:mm")
                : "Not yet"}
            </p>
          </div>
        </section>
      </div>

      <div className="admin-print-only space-y-3 p-2">
        <h1 className="admin-brand text-3xl">ZAVÉLIA</h1>
        <p>Order summary · {order.orderNumber}</p>
        <p>
          {order.customer.name} · {order.customer.phone}
        </p>
        {addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <ul className="mt-4 space-y-1">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.productName} ({item.variantName}) × {item.quantity} —{" "}
              {formatINRFromPaise(item.lineTotalInPaise)}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-semibold">
          Total: {formatINRFromPaise(order.totalInPaise)}
        </p>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm === "release" ? "Release reserved stock?" : "Cancel order?"
        }
        description={
          confirm === "release"
            ? "This releases reserved stock without decreasing on-hand inventory. It cannot be undone twice."
            : "Cancelling will release reserved stock (if still held) and mark the order cancelled."
        }
        confirmLabel={confirm === "release" ? "Release stock" : "Cancel order"}
        destructive
        loading={busy}
        onConfirm={confirmAction}
      />
    </div>
  );
}
