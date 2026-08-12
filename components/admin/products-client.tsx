"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { adminFetch } from "@/lib/admin/fetch";
import { formatINRFromPaise } from "@/lib/utils/money";

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  audience: string;
  isActive: boolean;
  isFeatured: boolean;
  priceInPaise: number;
  category: { name: string };
  _count: { variants: number };
  images?: Array<{ url: string; isPrimary?: boolean }>;
};

type ProductsClientProps = {
  products: ProductListItem[];
};

export function ProductsClient({ products }: ProductsClientProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<
    "activate" | "deactivate" | "delete" | null
  >(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (status === "active" && !p.isActive) return false;
      if (status === "inactive" && p.isActive) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.name.toLowerCase().includes(query)
      );
    });
  }, [products, q, status]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(filtered.map((p) => p.id)));
  }

  async function bulkSetActive(isActive: boolean) {
    setBusy(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          adminFetch(`/api/admin/products/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ isActive }),
          }),
        ),
      );
      toast.success(isActive ? "Products activated" : "Products deactivated");
      setSelected(new Set());
      setConfirm(null);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct() {
    if (!deleteId) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/products/${deleteId}`, {
        method: "DELETE",
      });
      toast.success("Product deleted from storefront");
      setConfirm(null);
      setDeleteId(null);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 text-[#161616]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl text-[#111827]">
            Products
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            {products.filter((p) => p.isActive).length} live on storefront ·{" "}
            {products.length} total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search name, SKU, category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64 text-[#161616]"
          />
          <select
            className="h-11 rounded-md border border-[#E8D1BA] bg-white px-3 text-sm text-[#161616]"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "all" | "active" | "inactive")
            }
          >
            <option value="all">All statuses</option>
            <option value="active">On storefront</option>
            <option value="inactive">Hidden</option>
          </select>
          <Button
            type="button"
            variant="outline"
            disabled={!selected.size || pending}
            onClick={() => setConfirm("activate")}
          >
            Activate
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!selected.size || pending}
            onClick={() => setConfirm("deactivate")}
          >
            Hide
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        </div>
      </div>

      <DataTable
        rows={filtered}
        rowKey={(p) => p.id}
        columns={[
          {
            key: "select",
            header: "",
            className: "w-10",
            render: (p) => (
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                aria-label={`Select ${p.name}`}
                className="h-4 w-4 accent-[#B88968]"
              />
            ),
          },
          {
            key: "image",
            header: "",
            className: "w-16",
            render: (p) => {
              const img =
                p.images?.find((i) => i.isPrimary) ?? p.images?.[0] ?? null;
              return (
                <div className="relative h-12 w-12 overflow-hidden bg-[#F7EFE5]">
                  {img ? (
                    <Image
                      src={img.url}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-[#6B7280]">
                      No img
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            key: "name",
            header: "Product",
            render: (p) => (
              <div>
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="font-medium text-[#111827] hover:text-[#374151]"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-[#6B7280]">{p.sku}</p>
              </div>
            ),
          },
          {
            key: "category",
            header: "Category",
            render: (p) => (
              <span className="text-[#374151]">{p.category.name}</span>
            ),
          },
          {
            key: "price",
            header: "Price",
            render: (p) => (
              <span className="text-[#111827]">
                {formatINRFromPaise(p.priceInPaise)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Storefront",
            render: (p) =>
              p.isActive ? (
                <span className="rounded bg-[#ECFDF5] px-2 py-1 text-xs font-medium text-[#15803D]">
                  Live
                </span>
              ) : (
                <span className="rounded bg-[#F3F4F6] px-2 py-1 text-xs font-medium text-[#6B7280]">
                  Hidden
                </span>
              ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (p) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="text-xs font-medium text-[#374151] underline"
                >
                  Edit
                </Link>
                <Link
                  href={`/product/${p.slug}`}
                  target="_blank"
                  className="text-xs font-medium text-[#6B7280] underline"
                >
                  View
                </Link>
                <button
                  type="button"
                  className="text-xs font-medium text-[#B91C1C] underline"
                  onClick={() => {
                    setDeleteId(p.id);
                    setConfirm("delete");
                  }}
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <div className="flex items-center gap-2 text-sm text-[#4B5563]">
        <button type="button" className="underline" onClick={toggleAll}>
          {selected.size === filtered.length && filtered.length
            ? "Clear selection"
            : "Select all filtered"}
        </button>
        <span>· {selected.size} selected</span>
      </div>

      <ConfirmDialog
        open={confirm === "activate" || confirm === "deactivate"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm === "deactivate"
            ? "Hide products from storefront?"
            : "Show products on storefront?"
        }
        description={`This will ${confirm === "deactivate" ? "hide" : "publish"} ${selected.size} product(s) on the customer website immediately.`}
        confirmLabel={confirm === "deactivate" ? "Hide" : "Publish"}
        destructive={confirm === "deactivate"}
        loading={busy}
        onConfirm={() => bulkSetActive(confirm === "activate")}
      />

      <ConfirmDialog
        open={confirm === "delete"}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null);
            setDeleteId(null);
          }
        }}
        title="Delete product permanently?"
        description="This removes the product from the storefront and admin catalogue. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={deleteProduct}
      />
    </div>
  );
}
