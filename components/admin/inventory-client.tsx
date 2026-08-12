"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { adminFetch, AdminApiError } from "@/lib/admin/fetch";
import { availableStock } from "@/lib/utils/stock";

export type InventoryRow = {
  id: string;
  sku: string;
  name: string;
  value: string;
  stockOnHand: number;
  stockReserved: number;
  lowStockThreshold: number;
  product: { id: string; name: string };
};

type InventoryClientProps = {
  rows: InventoryRow[];
};

export function InventoryClient({ rows }: InventoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [filter, setFilter] = useState<"all" | "low" | "oos">(
    (searchParams.get("filter") as "all" | "low" | "oos") || "all",
  );
  const [variantId, setVariantId] = useState(rows[0]?.id ?? "");
  const [delta, setDelta] = useState("0");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const avail = availableStock(r.stockOnHand, r.stockReserved);
      if (filter === "oos" && avail > 0) return false;
      if (
        filter === "low" &&
        !(avail > 0 && avail <= r.lowStockThreshold)
      ) {
        return false;
      }
      if (!query) return true;
      return (
        r.sku.toLowerCase().includes(query) ||
        r.product.name.toLowerCase().includes(query) ||
        r.value.toLowerCase().includes(query)
      );
    });
  }, [rows, q, filter]);

  async function submitAdjust() {
    setBusy(true);
    setError(null);
    try {
      await adminFetch("/api/admin/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({
          variantId,
          quantityDelta: Number(delta),
          reason: reason.trim(),
        }),
      });
      setConfirmOpen(false);
      setDelta("0");
      setReason("");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Adjustment failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search product or SKU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <select
            className="h-11 rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "low" | "oos")
            }
          >
            <option value="all">All</option>
            <option value="low">Low stock</option>
            <option value="oos">Out of stock</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/inventory?history=1">View history</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="/api/admin/exports/inventory">Export CSV</a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <form
          className="admin-card h-fit space-y-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setConfirmOpen(true);
          }}
        >
          <h2 className="admin-brand text-lg">Adjust stock</h2>
          {error ? (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="variant">Variant</Label>
            <select
              id="variant"
              className="flex h-11 w-full rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              required
            >
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.product.name} · {r.sku}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="delta">Quantity delta</Label>
            <Input
              id="delta"
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              required
            />
            <p className="text-xs text-[var(--color-espresso)]/50">
              Use negative values to decrease stock.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <Button type="submit" disabled={pending || !rows.length}>
            Review adjustment
          </Button>
        </form>

        <DataTable
          rows={filtered}
          rowKey={(r) => r.id}
          columns={[
            {
              key: "product",
              header: "Product",
              render: (r) => (
                <div>
                  <p className="font-medium">{r.product.name}</p>
                  <p className="text-xs text-[var(--color-espresso)]/50">
                    {r.name}: {r.value}
                  </p>
                </div>
              ),
            },
            { key: "sku", header: "SKU", render: (r) => r.sku },
            {
              key: "onHand",
              header: "On hand",
              render: (r) => r.stockOnHand,
            },
            {
              key: "reserved",
              header: "Reserved",
              render: (r) => r.stockReserved,
            },
            {
              key: "available",
              header: "Available",
              render: (r) =>
                availableStock(r.stockOnHand, r.stockReserved),
            },
            {
              key: "threshold",
              header: "Low at",
              render: (r) => r.lowStockThreshold,
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm stock adjustment"
        description={`Apply delta ${delta} to the selected variant? This writes an inventory transaction and cannot be silent.`}
        confirmLabel="Apply adjustment"
        loading={busy}
        onConfirm={submitAdjust}
      />
    </div>
  );
}
