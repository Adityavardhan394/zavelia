import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { buildOrderWhatsAppUrl } from "@/lib/orders/create-order";
import { formatINRFromPaise } from "@/lib/utils/money";
import { Button } from "@/components/ui/button";
import { firstParam } from "@/lib/store/safe-queries";

export const metadata = {
  title: "Order",
  description: "Your ZAVÉLIA order status.",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orderNumber } = await params;
  const sp = await searchParams;
  const token = firstParam(sp.token) ?? firstParam(sp.publicToken);

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl">
          Order access required
        </h1>
        <p className="mt-3 text-sm text-[var(--color-espresso)]/70">
          Open the link from your confirmation message to view this order.
        </p>
        <Button asChild className="mt-8">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  let order;
  try {
    order = await prisma.order.findFirst({
      where: {
        orderNumber,
        publicToken: token,
      },
      include: { items: true, customer: true },
    });
  } catch {
    order = null;
  }

  if (!order) notFound();

  const whatsappUrl = buildOrderWhatsAppUrl(order);
  const address = order.shippingAddressSnapshot as {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-rose-gold)]">
        Order {order.orderNumber}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl">
        Thank you
      </h1>
      <p className="mt-3 text-sm text-[var(--color-espresso)]/70">
        Status:{" "}
        <span className="font-medium text-[var(--color-espresso)]">
          {order.status.replaceAll("_", " ")}
        </span>
      </p>

      {order.status === "WHATSAPP_PENDING" ? (
        <div className="mt-6 border border-[var(--color-champagne)] bg-[var(--color-champagne)]/20 p-5 text-sm leading-relaxed">
          Your order is reserved while you confirm on WhatsApp. Tap below if the
          chat didn&apos;t open automatically.
        </div>
      ) : null}

      <div className="mt-8 space-y-3 border border-[var(--color-champagne)] bg-white/60 p-5 text-sm">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-[var(--color-espresso)]/55">
                {item.variantName} · Qty {item.quantity}
              </p>
            </div>
            <p>{formatINRFromPaise(item.lineTotalInPaise)}</p>
          </div>
        ))}
        <div className="space-y-1 border-t border-[var(--color-champagne)]/60 pt-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINRFromPaise(order.subtotalInPaise)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {order.shippingInPaise === 0
                ? "FREE"
                : formatINRFromPaise(order.shippingInPaise)}
            </span>
          </div>
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span>{formatINRFromPaise(order.totalInPaise)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-[var(--color-espresso)]/70">
        <p className="font-medium text-[var(--color-espresso)]">Deliver to</p>
        <p className="mt-1">{address.fullName}</p>
        <p>{address.phone}</p>
        <p>
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
        </p>
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Continue on WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/shop">Keep shopping</Link>
        </Button>
      </div>
    </div>
  );
}
