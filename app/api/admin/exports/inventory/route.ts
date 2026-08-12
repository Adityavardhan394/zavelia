import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fail } from "@/lib/utils/api";
import { availableStock } from "@/lib/utils/stock";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });

  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { sku: "asc" },
  });

  const header = [
    "sku",
    "product",
    "variant",
    "stockOnHand",
    "stockReserved",
    "available",
    "lowStockThreshold",
  ];
  const rows = variants.map((v) =>
    [
      v.sku,
      v.product.name,
      `${v.name}:${v.value}`,
      v.stockOnHand,
      v.stockReserved,
      availableStock(v.stockOnHand, v.stockReserved),
      v.lowStockThreshold,
    ]
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="zavelia-inventory.csv"',
    },
  });
}
