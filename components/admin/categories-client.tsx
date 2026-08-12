"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/data-table";
import { adminFetch, AdminApiError } from "@/lib/admin/fetch";

const AUDIENCES = ["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"] as const;

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  audience: string;
  sortOrder: number;
  isActive: boolean;
  description: string | null;
  imageUrl: string | null;
  _count: { products: number };
};

type CategoriesClientProps = {
  categories: CategoryRow[];
};

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [audience, setAudience] =
    useState<(typeof AUDIENCES)[number]>("WOMEN");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setAudience("WOMEN");
    setDescription("");
    setImageUrl("");
    setSortOrder("0");
    setIsActive(true);
    setError(null);
  }

  function startEdit(cat: CategoryRow) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setAudience(cat.audience as (typeof AUDIENCES)[number]);
    setDescription(cat.description ?? "");
    setImageUrl(cat.imageUrl ?? "");
    setSortOrder(String(cat.sortOrder));
    setIsActive(cat.isActive);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      audience,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || "",
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };

    try {
      if (editingId) {
        await adminFetch(`/api/admin/categories/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Could not save category",
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={onSubmit} className="admin-card h-fit space-y-3 p-4">
        <h2 className="admin-brand text-lg">
          {editingId ? "Edit category" : "New category"}
        </h2>
        {error ? (
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-slug">Slug</Label>
          <Input
            id="cat-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-audience">Audience</Label>
          <select
            id="cat-audience"
            className="flex h-11 w-full rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
            value={audience}
            onChange={(e) =>
              setAudience(e.target.value as (typeof AUDIENCES)[number])
            }
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-desc">Description</Label>
          <Textarea
            id="cat-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-image">Image URL</Label>
          <Input
            id="cat-image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-sort">Sort order</Label>
          <Input
            id="cat-sort"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-rose-gold)]"
          />
          Active
        </label>
        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={pending}>
            {editingId ? "Save" : "Create"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      <DataTable
        rows={categories}
        rowKey={(c) => c.id}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (c) => (
              <button
                type="button"
                className="text-left font-medium hover:text-[var(--color-rose-gold)]"
                onClick={() => startEdit(c)}
              >
                {c.name}
              </button>
            ),
          },
          { key: "slug", header: "Slug", render: (c) => c.slug },
          { key: "audience", header: "Audience", render: (c) => c.audience },
          {
            key: "products",
            header: "Products",
            render: (c) => c._count.products,
          },
          {
            key: "active",
            header: "Active",
            render: (c) => (c.isActive ? "Yes" : "No"),
          },
          {
            key: "sort",
            header: "Sort",
            render: (c) => c.sortOrder,
          },
        ]}
      />
    </div>
  );
}
