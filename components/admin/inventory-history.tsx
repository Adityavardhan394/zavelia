"use client";

import { format } from "date-fns";
import { DataTable } from "@/components/admin/data-table";

export type TxRow = {
  id: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdAt: string | Date;
  previousStockOnHand: number;
  newStockOnHand: number;
  previousStockReserved: number;
  newStockReserved: number;
  variant: {
    sku: string;
    product: { name: string };
  };
  order: { orderNumber: string } | null;
};

export function InventoryHistory({ rows }: { rows: TxRow[] }) {
  return (
    <div className="space-y-3">
      <h2 className="admin-brand text-lg">Inventory history</h2>
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        emptyMessage="No transactions yet."
        columns={[
          {
            key: "when",
            header: "When",
            render: (r) =>
              format(new Date(r.createdAt), "dd MMM yyyy HH:mm"),
          },
          {
            key: "product",
            header: "Product",
            render: (r) => (
              <div>
                <p>{r.variant.product.name}</p>
                <p className="text-xs text-[var(--color-espresso)]/50">
                  {r.variant.sku}
                </p>
              </div>
            ),
          },
          { key: "type", header: "Type", render: (r) => r.type },
          { key: "qty", header: "Qty", render: (r) => r.quantity },
          {
            key: "stock",
            header: "On hand",
            render: (r) =>
              `${r.previousStockOnHand} → ${r.newStockOnHand}`,
          },
          {
            key: "reserved",
            header: "Reserved",
            render: (r) =>
              `${r.previousStockReserved} → ${r.newStockReserved}`,
          },
          {
            key: "order",
            header: "Order",
            render: (r) => r.order?.orderNumber ?? "—",
          },
          {
            key: "reason",
            header: "Reason",
            render: (r) => r.reason ?? "—",
          },
        ]}
      />
    </div>
  );
}
