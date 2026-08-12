import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api";
import { availableStock } from "@/lib/utils/stock";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });

  const [
    totalOrders,
    pendingWhatsapp,
    confirmedOrders,
    paidOrders,
    activeProducts,
    variants,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "WHATSAPP_PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.findMany({
      where: {
        OR: [
          { paymentStatus: "PAID" },
          { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        ],
        status: { not: "WHATSAPP_PENDING" },
      },
      select: { totalInPaise: true, status: true, paymentStatus: true, createdAt: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: { select: { name: true, slug: true } } },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  ]);

  const revenueInPaise = paidOrders
    .filter(
      (o) =>
        o.paymentStatus === "PAID" ||
        ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status),
    )
    .reduce((sum, o) => sum + o.totalInPaise, 0);

  const outOfStock = variants.filter(
    (v) => availableStock(v.stockOnHand, v.stockReserved) <= 0,
  );
  const lowStock = variants.filter((v) => {
    const available = availableStock(v.stockOnHand, v.stockReserved);
    return available > 0 && available <= v.lowStockThreshold;
  });

  const statusGroups = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return ok({
    totals: {
      totalOrders,
      pendingWhatsapp,
      confirmedOrders,
      revenueInPaise,
      activeProducts,
      outOfStockProducts: outOfStock.length,
      lowStockProducts: lowStock.length,
    },
    recentOrders,
    inventoryAlerts: [...outOfStock, ...lowStock].slice(0, 10),
    ordersByStatus: statusGroups.map((g) => ({
      status: g.status,
      count: g._count._all,
    })),
    salesTrend: paidOrders.slice(-30),
  });
}
