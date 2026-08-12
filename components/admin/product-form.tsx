"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/image-uploader";
import { adminFetch, AdminApiError } from "@/lib/admin/fetch";
import { rupeesToPaise, paiseToRupees } from "@/lib/utils/money";
import { slugify } from "@/lib/utils/cn";

const AUDIENCES = ["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"] as const;

type CategoryOption = { id: string; name: string };

type VariantDraft = {
  id?: string;
  name: string;
  value: string;
  sku: string;
  priceAdjustmentInPaise: number;
  stockOnHand: number;
  lowStockThreshold: number;
  isActive: boolean;
};

export type ProductFormInitial = {
  id?: string;
  name: string;
  slug?: string;
  sku: string;
  shortDescription?: string | null;
  description?: string | null;
  material?: string | null;
  careInstructions?: string | null;
  audience: (typeof AUDIENCES)[number];
  categoryId: string;
  priceInPaise: number;
  compareAtPriceInPaise?: number | null;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  variants: VariantDraft[];
  images?: UploadedImage[];
};

type ProductFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initial?: ProductFormInitial;
};

function emptyVariant(): VariantDraft {
  return {
    name: "Size",
    value: "One Size",
    sku: "",
    priceAdjustmentInPaise: 0,
    stockOnHand: 0,
    lowStockThreshold: 5,
    isActive: true,
  };
}

export function ProductForm({ mode, categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [shortDescription, setShortDescription] = useState(
    initial?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [careInstructions, setCareInstructions] = useState(
    initial?.careInstructions ?? "",
  );
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>(
    initial?.audience ?? "WOMEN",
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [priceRupees, setPriceRupees] = useState(
    String(paiseToRupees(initial?.priceInPaise ?? 0)),
  );
  const [compareAtRupees, setCompareAtRupees] = useState(
    initial?.compareAtPriceInPaise != null
      ? String(paiseToRupees(initial.compareAtPriceInPaise))
      : "",
  );
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(
    initial?.isNewArrival ?? false,
  );
  const [isBestSeller, setIsBestSeller] = useState(
    initial?.isBestSeller ?? false,
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initial?.seoDescription ?? "",
  );
  const [variants, setVariants] = useState<VariantDraft[]>(
    initial?.variants?.length ? initial.variants : [emptyVariant()],
  );
  const [images, setImages] = useState<UploadedImage[]>(initial?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const autoSlug = useMemo(() => slugify(name), [name]);

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const priceInPaise = rupeesToPaise(Number(priceRupees) || 0);
      const compareAtPriceInPaise = compareAtRupees.trim()
        ? rupeesToPaise(Number(compareAtRupees) || 0)
        : null;

      const payload = {
        name: name.trim(),
        slug: (slug.trim() || autoSlug).trim(),
        sku: sku.trim(),
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        material: material.trim() || undefined,
        careInstructions: careInstructions.trim() || undefined,
        audience,
        categoryId,
        priceInPaise,
        compareAtPriceInPaise,
        isFeatured,
        isNewArrival,
        isBestSeller,
        isActive,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        variants: variants.map((v) => ({
          name: v.name.trim(),
          value: v.value.trim(),
          sku: v.sku.trim(),
          priceAdjustmentInPaise: Number(v.priceAdjustmentInPaise) || 0,
          stockOnHand: Number(v.stockOnHand) || 0,
          lowStockThreshold: Number(v.lowStockThreshold) || 0,
          isActive: v.isActive,
        })),
        images: images.map((img, i) => ({
          url: img.url,
          altText: img.altText,
          sortOrder: i,
          isPrimary: img.isPrimary,
        })),
      };

      if (mode === "create") {
        await adminFetch<{ id: string }>("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push("/admin/products");
        router.refresh();
      } else if (initial?.id) {
        await adminFetch(`/api/admin/products/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save product",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error ? (
        <p className="rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 px-3 py-2 text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      <section className="admin-card space-y-4 p-4 md:p-5">
        <h2 className="admin-brand text-lg">Basics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              placeholder={autoSlug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="audience">Audience</Label>
            <select
              id="audience"
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
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              className="flex h-11 w-full rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compareAt">Compare-at price (₹)</Label>
            <Input
              id="compareAt"
              type="number"
              min="0"
              step="0.01"
              value={compareAtRupees}
              onChange={(e) => setCompareAtRupees(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="material">Material</Label>
            <Input
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="care">Care instructions</Label>
            <Input
              id="care"
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-1 text-sm">
          {(
            [
              ["Active", isActive, setIsActive],
              ["Featured", isFeatured, setIsFeatured],
              ["New arrival", isNewArrival, setIsNewArrival],
              ["Best seller", isBestSeller, setIsBestSeller],
            ] as const
          ).map(([label, checked, setter]) => (
            <label key={label} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setter(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-rose-gold)]"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="admin-card space-y-4 p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="admin-brand text-lg">Variants</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setVariants((v) => [...v, emptyVariant()])}
          >
            <Plus className="h-4 w-4" />
            Add variant
          </Button>
        </div>
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-md border border-[var(--admin-border)] bg-white/70 p-3 md:grid-cols-6"
            >
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(index, { name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Value</Label>
                <Input
                  value={variant.value}
                  onChange={(e) =>
                    updateVariant(index, { value: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>SKU</Label>
                <Input
                  value={variant.sku}
                  onChange={(e) =>
                    updateVariant(index, { sku: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Adj. (paise)</Label>
                <Input
                  type="number"
                  value={variant.priceAdjustmentInPaise}
                  onChange={(e) =>
                    updateVariant(index, {
                      priceAdjustmentInPaise: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Stock</Label>
                <Input
                  type="number"
                  min={0}
                  value={variant.stockOnHand}
                  onChange={(e) =>
                    updateVariant(index, {
                      stockOnHand: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Low stock</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={variant.lowStockThreshold}
                    onChange={(e) =>
                      updateVariant(index, {
                        lowStockThreshold: Number(e.target.value) || 0,
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={variants.length <= 1}
                    onClick={() =>
                      setVariants((prev) => prev.filter((_, i) => i !== index))
                    }
                    aria-label="Remove variant"
                  >
                    <Trash2 className="h-4 w-4 text-[var(--color-error)]" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card space-y-4 p-4 md:p-5">
        <h2 className="admin-brand text-lg">Images</h2>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      <section className="admin-card space-y-4 p-4 md:p-5">
        <h2 className="admin-brand text-lg">SEO</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input
              id="seoTitle"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="seoDescription">SEO description</Label>
            <Textarea
              id="seoDescription"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Back to list
        </Button>
      </div>
    </form>
  );
}
