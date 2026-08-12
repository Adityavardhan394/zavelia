import { formatINRFromPaise } from "@/lib/utils/money";

export type WhatsAppOrderItem = {
  productName: string;
  sku: string;
  variantName: string;
  quantity: number;
  unitPriceInPaise: number;
  lineTotalInPaise: number;
};

export type WhatsAppOrderPayload = {
  orderNumber: string;
  customerName: string;
  phone: string;
  addressLines: string[];
  items: WhatsAppOrderItem[];
  subtotalInPaise: number;
  discountInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  customerNotes?: string | null;
  orderUrl?: string | null;
};

export function buildWhatsAppMessage(payload: WhatsAppOrderPayload): string {
  const lines: string[] = [
    "*ZAVÉLIA*",
    "Elegance For Every You",
    "",
    `Order: *${payload.orderNumber}*`,
    `Customer: ${payload.customerName}`,
    `Phone: ${payload.phone}`,
    "",
    "*Delivery Address*",
    ...payload.addressLines,
    "",
    "*Items*",
  ];

  for (const item of payload.items) {
    lines.push(
      `• ${item.productName} (${item.variantName})`,
      `  SKU: ${item.sku}`,
      `  Qty: ${item.quantity} × ${formatINRFromPaise(item.unitPriceInPaise)} = ${formatINRFromPaise(item.lineTotalInPaise)}`,
    );
  }

  lines.push(
    "",
    `Subtotal: ${formatINRFromPaise(payload.subtotalInPaise)}`,
    `Discount: ${formatINRFromPaise(payload.discountInPaise)}`,
    `Shipping: ${payload.shippingInPaise === 0 ? "FREE" : formatINRFromPaise(payload.shippingInPaise)}`,
    `*Total: ${formatINRFromPaise(payload.totalInPaise)}*`,
  );

  if (payload.customerNotes?.trim()) {
    lines.push("", `Notes: ${payload.customerNotes.trim()}`);
  }

  if (payload.orderUrl) {
    lines.push("", `View order: ${payload.orderUrl}`);
  }

  lines.push("", "Please confirm this order. Thank you!");
  return lines.join("\n");
}

export function buildWhatsAppUrl(
  businessNumber: string,
  message: string,
): string {
  const digits = businessNumber.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}
