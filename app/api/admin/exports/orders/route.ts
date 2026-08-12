import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fail } from "@/lib/utils/api";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });

  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  const header = [
    "orderNumber",
    "status",
    "paymentStatus",
    "customerName",
    "phone",
    "subtotalInPaise",
    "shippingInPaise",
    "totalInPaise",
    "createdAt",
  ];
  const rows = orders.map((o) =>
    [
      o.orderNumber,
      o.status,
      o.paymentStatus,
      o.customer.name,
      o.customer.phone,
      o.subtotalInPaise,
      o.shippingInPaise,
      o.totalInPaise,
      o.createdAt.toISOString(),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="zavelia-orders.csv"',
    },
  });
}
