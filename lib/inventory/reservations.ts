import {
  InventoryTransactionType,
  OrderStatus,
  Prisma,
  type PrismaClient,
} from "@prisma/client";
import { availableStock } from "@/lib/utils/stock";

type Tx = Prisma.TransactionClient | PrismaClient;

export async function reserveStockForOrder(
  tx: Tx,
  input: {
    orderId: string;
    items: Array<{ variantId: string; quantity: number }>;
  },
) {
  for (const item of input.items) {
    const variant = await tx.productVariant.findUnique({
      where: { id: item.variantId },
    });

    if (!variant || !variant.isActive) {
      throw new Error(`Variant unavailable: ${item.variantId}`);
    }

    const available = availableStock(variant.stockOnHand, variant.stockReserved);
    if (available < item.quantity) {
      throw new Error(`Insufficient stock for SKU ${variant.sku}`);
    }

    const previousStockOnHand = variant.stockOnHand;
    const previousStockReserved = variant.stockReserved;
    const newStockReserved = previousStockReserved + item.quantity;

    await tx.productVariant.update({
      where: { id: variant.id },
      data: { stockReserved: newStockReserved },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId: variant.id,
        orderId: input.orderId,
        type: InventoryTransactionType.RESERVED,
        quantity: item.quantity,
        previousStockOnHand,
        newStockOnHand: previousStockOnHand,
        previousStockReserved,
        newStockReserved,
        reason: "Order reservation",
      },
    });
  }
}

export async function releaseOrderStock(
  tx: Tx,
  input: {
    orderId: string;
    reason: string;
    performedByUserId?: string | null;
  },
) {
  const order = await tx.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.stockReleasedAt) {
    return { alreadyReleased: true as const };
  }

  for (const item of order.items) {
    if (!item.variantId) continue;

    const variant = await tx.productVariant.findUnique({
      where: { id: item.variantId },
    });
    if (!variant) continue;

    const previousStockOnHand = variant.stockOnHand;
    const previousStockReserved = variant.stockReserved;
    const newStockReserved = Math.max(0, previousStockReserved - item.quantity);

    await tx.productVariant.update({
      where: { id: variant.id },
      data: { stockReserved: newStockReserved },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId: variant.id,
        orderId: order.id,
        type: InventoryTransactionType.RELEASED,
        quantity: item.quantity,
        previousStockOnHand,
        newStockOnHand: previousStockOnHand,
        previousStockReserved,
        newStockReserved,
        reason: input.reason,
        performedByUserId: input.performedByUserId ?? undefined,
      },
    });
  }

  await tx.order.update({
    where: { id: order.id },
    data: { stockReleasedAt: new Date() },
  });

  return { alreadyReleased: false as const };
}

export async function confirmOrderStock(
  tx: Tx,
  input: {
    orderId: string;
    performedByUserId?: string | null;
  },
) {
  const order = await tx.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.stockReleasedAt) {
    throw new Error("Stock already released for this order");
  }

  for (const item of order.items) {
    if (!item.variantId) continue;

    const variant = await tx.productVariant.findUnique({
      where: { id: item.variantId },
    });
    if (!variant) continue;

    if (variant.stockReserved < item.quantity || variant.stockOnHand < item.quantity) {
      throw new Error(`Cannot confirm stock for SKU ${variant.sku}`);
    }

    const previousStockOnHand = variant.stockOnHand;
    const previousStockReserved = variant.stockReserved;
    const newStockOnHand = previousStockOnHand - item.quantity;
    const newStockReserved = previousStockReserved - item.quantity;

    await tx.productVariant.update({
      where: { id: variant.id },
      data: {
        stockOnHand: newStockOnHand,
        stockReserved: newStockReserved,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId: variant.id,
        orderId: order.id,
        type: InventoryTransactionType.STOCK_OUT,
        quantity: item.quantity,
        previousStockOnHand,
        newStockOnHand,
        previousStockReserved,
        newStockReserved,
        reason: "Order confirmed",
        performedByUserId: input.performedByUserId ?? undefined,
      },
    });
  }

  await tx.order.update({
    where: { id: order.id },
    data: {
      stockReleasedAt: new Date(),
      confirmedAt: new Date(),
      status: OrderStatus.CONFIRMED,
    },
  });
}

export async function adjustStock(
  tx: Tx,
  input: {
    variantId: string;
    quantityDelta: number;
    reason: string;
    performedByUserId: string;
  },
) {
  const variant = await tx.productVariant.findUnique({
    where: { id: input.variantId },
  });
  if (!variant) {
    throw new Error("Variant not found");
  }

  const previousStockOnHand = variant.stockOnHand;
  const previousStockReserved = variant.stockReserved;
  const newStockOnHand = previousStockOnHand + input.quantityDelta;

  if (newStockOnHand < 0) {
    throw new Error("Stock cannot become negative");
  }
  if (newStockOnHand < previousStockReserved) {
    throw new Error("Stock on hand cannot be less than reserved stock");
  }

  await tx.productVariant.update({
    where: { id: variant.id },
    data: { stockOnHand: newStockOnHand },
  });

  const type =
    input.quantityDelta >= 0
      ? InventoryTransactionType.STOCK_IN
      : InventoryTransactionType.ADJUSTMENT;

  await tx.inventoryTransaction.create({
    data: {
      variantId: variant.id,
      type,
      quantity: Math.abs(input.quantityDelta),
      previousStockOnHand,
      newStockOnHand,
      previousStockReserved,
      newStockReserved: previousStockReserved,
      reason: input.reason,
      performedByUserId: input.performedByUserId,
    },
  });

  return { previousStockOnHand, newStockOnHand };
}

export async function releaseExpiredReservations(tx: Tx) {
  const now = new Date();
  const expired = await tx.order.findMany({
    where: {
      status: OrderStatus.WHATSAPP_PENDING,
      stockReleasedAt: null,
      stockReservationExpiresAt: { lte: now },
    },
    select: { id: true },
  });

  let released = 0;
  for (const order of expired) {
    await releaseOrderStock(tx, {
      orderId: order.id,
      reason: "Reservation expired after 30 minutes",
    });
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: now,
      },
    });
    released += 1;
  }

  return { released, orderIds: expired.map((o) => o.id) };
}
