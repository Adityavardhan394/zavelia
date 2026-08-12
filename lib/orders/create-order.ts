import { Prisma, type OrderStatus, type PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  reserveStockForOrder,
  releaseOrderStock,
  confirmOrderStock,
} from "@/lib/inventory/reservations";
import {
  calculateOrderTotals,
  FREE_SHIPPING_THRESHOLD_PAISE,
  STANDARD_SHIPPING_PAISE,
} from "@/lib/utils/money";
import {
  generateOrderNumber,
  reservationExpiresAt,
} from "@/lib/utils/order-number";
import { availableStock } from "@/lib/utils/stock";
import { sanitizeText } from "@/lib/security/sanitize";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp/message";
import { absoluteUrl } from "@/lib/utils/cn";
import type { CreateOrderInput } from "@/lib/validations";

export class OrderServiceError extends Error {
  constructor(
    message: string,
    public code: string = "ORDER_ERROR",
  ) {
    super(message);
    this.name = "OrderServiceError";
  }
}

async function nextOrderNumber(tx: Prisma.TransactionClient, date = new Date()) {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const count = await tx.order.count({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });
  return generateOrderNumber(date, count + 1);
}

type OrderWithRelations = {
  orderNumber: string;
  publicToken: string;
  subtotalInPaise: number;
  discountInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  customerNotes?: string | null;
  shippingAddressSnapshot: unknown;
  items: Array<{
    productName: string;
    sku: string;
    variantName: string;
    quantity: number;
    unitPriceInPaise: number;
    lineTotalInPaise: number;
  }>;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  } | null;
};

export function buildOrderWhatsAppUrl(order: OrderWithRelations) {
  const number = process.env.WHATSAPP_BUSINESS_NUMBER || "";
  const snapshot = order.shippingAddressSnapshot as {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  const addressLines = [
    snapshot.addressLine1,
    snapshot.addressLine2,
    snapshot.landmark,
    `${snapshot.city}, ${snapshot.state} ${snapshot.postalCode}`,
    snapshot.country,
  ].filter(Boolean) as string[];

  const message = buildWhatsAppMessage({
    orderNumber: order.orderNumber,
    customerName: snapshot.fullName,
    phone: snapshot.phone,
    addressLines,
    items: order.items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPriceInPaise: item.unitPriceInPaise,
      lineTotalInPaise: item.lineTotalInPaise,
    })),
    subtotalInPaise: order.subtotalInPaise,
    discountInPaise: order.discountInPaise,
    shippingInPaise: order.shippingInPaise,
    totalInPaise: order.totalInPaise,
    customerNotes: order.customerNotes,
    orderUrl: absoluteUrl(
      `/order/${order.orderNumber}?token=${order.publicToken}`,
    ),
  });

  return buildWhatsAppUrl(number, message);
}

export async function createOrderFromCheckout(input: CreateOrderInput) {
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    include: { items: true, customer: true },
  });

  if (existing) {
    return {
      order: existing,
      whatsappUrl: buildOrderWhatsAppUrl(existing),
      reused: true as const,
    };
  }

  const settings = await prisma.siteSettings.findFirst();
  const freeThreshold =
    settings?.freeShippingThresholdInPaise ?? FREE_SHIPPING_THRESHOLD_PAISE;
  const standardShipping =
    settings?.standardShippingInPaise ?? STANDARD_SHIPPING_PAISE;

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const variantIds = input.items.map((i) => i.variantId);
        const variants = await tx.productVariant.findMany({
          where: { id: { in: variantIds } },
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        });

        const uniqueRequested = new Set(variantIds);
        if (variants.length !== uniqueRequested.size) {
          throw new OrderServiceError(
            "One or more products are unavailable",
            "PRODUCT_UNAVAILABLE",
          );
        }

        const variantMap = new Map(variants.map((v) => [v.id, v]));
        let subtotalInPaise = 0;
        const lineItems: Array<{
          productId: string;
          variantId: string;
          productName: string;
          productSlug: string;
          sku: string;
          variantName: string;
          quantity: number;
          unitPriceInPaise: number;
          lineTotalInPaise: number;
          productImageUrl: string | null;
        }> = [];

        for (const item of input.items) {
          const variant = variantMap.get(item.variantId);
          if (!variant || !variant.isActive || !variant.product.isActive) {
            throw new OrderServiceError(
              "A selected product is unavailable",
              "PRODUCT_UNAVAILABLE",
            );
          }
          if (variant.productId !== item.productId) {
            throw new OrderServiceError(
              "Product and variant mismatch",
              "INVALID_ITEM",
            );
          }

          const available = availableStock(
            variant.stockOnHand,
            variant.stockReserved,
          );
          if (available < item.quantity) {
            throw new OrderServiceError(
              `Insufficient stock for ${variant.product.name}`,
              "INSUFFICIENT_STOCK",
            );
          }

          const unitPriceInPaise =
            variant.product.priceInPaise + variant.priceAdjustmentInPaise;
          const lineTotalInPaise = unitPriceInPaise * item.quantity;
          subtotalInPaise += lineTotalInPaise;

          const primaryImage =
            variant.product.images.find((img) => img.isPrimary) ??
            variant.product.images[0];

          lineItems.push({
            productId: variant.productId,
            variantId: variant.id,
            productName: variant.product.name,
            productSlug: variant.product.slug,
            sku: variant.sku,
            variantName: `${variant.name}: ${variant.value}`,
            quantity: item.quantity,
            unitPriceInPaise,
            lineTotalInPaise,
            productImageUrl: primaryImage?.url ?? null,
          });
        }

        const totals = calculateOrderTotals({
          subtotalInPaise,
          discountInPaise: 0,
          freeShippingThresholdInPaise: freeThreshold,
          standardShippingInPaise: standardShipping,
        });

        const phone = input.address.phone;
        let customer = await tx.customer.findFirst({ where: { phone } });
        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: sanitizeText(input.address.fullName),
              phone,
              email: input.address.email
                ? sanitizeText(input.address.email)
                : null,
            },
          });
        } else {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              name: sanitizeText(input.address.fullName),
              email: input.address.email
                ? sanitizeText(input.address.email)
                : customer.email,
            },
          });
        }

        const addressSnapshot = {
          fullName: sanitizeText(input.address.fullName),
          phone: input.address.phone,
          email: input.address.email || null,
          addressLine1: sanitizeText(input.address.addressLine1),
          addressLine2: input.address.addressLine2
            ? sanitizeText(input.address.addressLine2)
            : null,
          landmark: input.address.landmark
            ? sanitizeText(input.address.landmark)
            : null,
          city: sanitizeText(input.address.city),
          state: sanitizeText(input.address.state),
          postalCode: input.address.postalCode,
          country: "India" as const,
        };

        await tx.address.create({
          data: {
            customerId: customer.id,
            fullName: addressSnapshot.fullName,
            phone: addressSnapshot.phone,
            addressLine1: addressSnapshot.addressLine1,
            addressLine2: addressSnapshot.addressLine2,
            landmark: addressSnapshot.landmark,
            city: addressSnapshot.city,
            state: addressSnapshot.state,
            postalCode: addressSnapshot.postalCode,
            country: "India",
          },
        });

        const orderNumber = await nextOrderNumber(tx);

        const created = await tx.order.create({
          data: {
            orderNumber,
            customerId: customer.id,
            shippingAddressSnapshot: addressSnapshot,
            status: "WHATSAPP_PENDING",
            paymentStatus: "UNPAID",
            subtotalInPaise: totals.subtotalInPaise,
            discountInPaise: totals.discountInPaise,
            shippingInPaise: totals.shippingInPaise,
            totalInPaise: totals.totalInPaise,
            customerNotes: input.address.customerNotes
              ? sanitizeText(input.address.customerNotes)
              : null,
            idempotencyKey: input.idempotencyKey,
            stockReservationExpiresAt: reservationExpiresAt(),
            items: {
              create: lineItems,
            },
          },
          include: {
            items: true,
            customer: true,
          },
        });

        await reserveStockForOrder(tx, {
          orderId: created.id,
          items: input.items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        });

        return created;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 20000,
      },
    );

    return {
      order,
      whatsappUrl: buildOrderWhatsAppUrl(order),
      reused: false as const,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existingAfterRace = await prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { items: true, customer: true },
      });
      if (existingAfterRace) {
        return {
          order: existingAfterRace,
          whatsappUrl: buildOrderWhatsAppUrl(existingAfterRace),
          reused: true as const,
        };
      }
    }
    throw error;
  }
}

export async function markWhatsAppOpened(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { whatsappOpenedAt: new Date() },
  });
}

export async function updateOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
  adminNotes?: string;
  performedByUserId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: input.orderId } });
    if (!order) {
      throw new OrderServiceError("Order not found", "NOT_FOUND");
    }

    if (input.status === "CONFIRMED" && order.status === "WHATSAPP_PENDING") {
      await confirmOrderStock(tx, {
        orderId: order.id,
        performedByUserId: input.performedByUserId,
      });
      if (input.adminNotes) {
        await tx.order.update({
          where: { id: order.id },
          data: { adminNotes: input.adminNotes },
        });
      }
      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { items: true, customer: true },
      });
    }

    if (input.status === "CANCELLED" && !order.stockReleasedAt) {
      await releaseOrderStock(tx, {
        orderId: order.id,
        reason: "Order cancelled",
        performedByUserId: input.performedByUserId,
      });
    }

    const data: Prisma.OrderUpdateInput = {
      status: input.status,
      adminNotes: input.adminNotes ?? order.adminNotes,
    };

    if (input.status === "CANCELLED") data.cancelledAt = new Date();
    if (input.status === "SHIPPED") data.shippedAt = new Date();
    if (input.status === "DELIVERED") data.deliveredAt = new Date();
    if (input.status === "CONFIRMED") data.confirmedAt = new Date();

    return tx.order.update({
      where: { id: order.id },
      data,
      include: { items: true, customer: true },
    });
  });
}

export async function updatePaymentStatus(input: {
  orderId: string;
  paymentStatus: PaymentStatus;
}) {
  return prisma.order.update({
    where: { id: input.orderId },
    data: { paymentStatus: input.paymentStatus },
    include: { items: true, customer: true },
  });
}
