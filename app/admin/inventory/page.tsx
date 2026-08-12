import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { InventoryClient } from "@/components/admin/inventory-client";
import { InventoryHistory } from "@/components/admin/inventory-history";

export const metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ history?: string; type?: string; q?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const sp = await searchParams;
  const showHistory = sp.history === "1";

  const [variants, transactions] = await Promise.all([
    prisma.productVariant.findMany({
      orderBy: [{ product: { name: "asc" } }, { sku: "asc" }],
      include: {
        product: { select: { id: true, name: true } },
      },
    }),
    showHistory
      ? prisma.inventoryTransaction.findMany({
          take: 100,
          orderBy: { createdAt: "desc" },
          where: sp.type
            ? {
                type: sp.type as
                  | "STOCK_IN"
                  | "STOCK_OUT"
                  | "RESERVED"
                  | "RELEASED"
                  | "ADJUSTMENT"
                  | "RETURNED",
              }
            : undefined,
          include: {
            variant: {
              select: {
                sku: true,
                product: { select: { name: true } },
              },
            },
            order: { select: { orderNumber: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="admin-brand text-2xl">Inventory</h1>
      <Suspense fallback={<p className="text-sm">Loading inventory…</p>}>
        <InventoryClient rows={variants} />
      </Suspense>
      {showHistory ? <InventoryHistory rows={transactions} /> : null}
    </div>
  );
}
