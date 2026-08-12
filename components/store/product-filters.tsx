"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { rupeesToPaise, paiseToRupees } from "@/lib/utils/money";

type AudienceValue = "WOMEN" | "MEN" | "GIRLS" | "UNISEX";

const AUDIENCES: { value: AudienceValue; label: string }[] = [
  { value: "WOMEN", label: "Women" },
  { value: "MEN", label: "Men" },
  { value: "GIRLS", label: "Girls" },
  { value: "UNISEX", label: "Unisex" },
];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
] as const;

type CategoryOption = { slug: string; name: string };

type ProductFiltersProps = {
  categories: CategoryOption[];
  className?: string;
};

export function ProductFilters({ categories, className }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
      }
      if (!("page" in patch)) next.delete("page");
      startTransition(() => {
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router, searchParams],
  );

  const chips = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const audience = searchParams.get("audience");
    const material = searchParams.get("material");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const sort = searchParams.get("sort");

    if (q) list.push({ key: "q", label: `“${q}”` });
    if (category) {
      const cat = categories.find((c) => c.slug === category);
      list.push({ key: "category", label: cat?.name ?? category });
    }
    if (audience) list.push({ key: "audience", label: audience });
    if (material) list.push({ key: "material", label: material });
    if (minPrice)
      list.push({
        key: "minPrice",
        label: `Min ₹${paiseToRupees(Number(minPrice))}`,
      });
    if (maxPrice)
      list.push({
        key: "maxPrice",
        label: `Max ₹${paiseToRupees(Number(maxPrice))}`,
      });
    if (inStock === "true") list.push({ key: "inStock", label: "In stock" });
    if (sort && sort !== "featured") {
      const s = SORTS.find((x) => x.value === sort);
      list.push({ key: "sort", label: s?.label ?? sort });
    }
    return list;
  }, [categories, searchParams]);

  const clearAll = () => {
    startTransition(() => router.push(pathname));
  };

  return (
    <div className={cn("space-y-6", className, pending && "opacity-80")}>
      <div className="space-y-3">
        <Label htmlFor="filter-q">Search</Label>
        <Input
          id="filter-q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Search…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update({
                q: (e.target as HTMLInputElement).value.trim() || null,
              });
            }
          }}
          onBlur={(e) => update({ q: e.target.value.trim() || null })}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="filter-category">Category</Label>
        <select
          id="filter-category"
          className="flex h-11 w-full rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
          value={searchParams.get("category") ?? ""}
          onChange={(e) => update({ category: e.target.value || null })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Audience</p>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => {
            const active = searchParams.get("audience") === a.value;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => update({ audience: active ? null : a.value })}
                className={cn(
                  "border px-3 py-1.5 text-xs tracking-wide transition",
                  active
                    ? "border-[var(--color-espresso)] bg-[var(--color-espresso)] text-white"
                    : "border-[var(--color-champagne)] bg-white hover:border-[var(--color-rose-gold)]",
                )}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="filter-material">Material</Label>
        <Input
          id="filter-material"
          defaultValue={searchParams.get("material") ?? ""}
          placeholder="e.g. gold plating"
          onBlur={(e) => update({ material: e.target.value.trim() || null })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="min-price">Min ₹</Label>
          <Input
            id="min-price"
            type="number"
            min={0}
            defaultValue={
              searchParams.get("minPrice")
                ? String(paiseToRupees(Number(searchParams.get("minPrice"))))
                : ""
            }
            onBlur={(e) => {
              const v = e.target.value.trim();
              update({
                minPrice: v ? String(rupeesToPaise(Number(v))) : null,
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-price">Max ₹</Label>
          <Input
            id="max-price"
            type="number"
            min={0}
            defaultValue={
              searchParams.get("maxPrice")
                ? String(paiseToRupees(Number(searchParams.get("maxPrice"))))
                : ""
            }
            onBlur={(e) => {
              const v = e.target.value.trim();
              update({
                maxPrice: v ? String(rupeesToPaise(Number(v))) : null,
              });
            }}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={searchParams.get("inStock") === "true"}
          onChange={(e) =>
            update({ inStock: e.target.checked ? "true" : null })
          }
          className="h-4 w-4 accent-[var(--color-rose-gold)]"
        />
        In stock only
      </label>

      <div className="space-y-3">
        <Label htmlFor="filter-sort">Sort</Label>
        <select
          id="filter-sort"
          className="flex h-11 w-full rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
          value={searchParams.get("sort") ?? "featured"}
          onChange={(e) => update({ sort: e.target.value })}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {chips.length > 0 ? (
        <div className="space-y-3 border-t border-[var(--color-champagne)]/60 pt-4">
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => update({ [chip.key]: null })}
                className="inline-flex items-center gap-1 border border-[var(--color-champagne)] bg-white px-2.5 py-1 text-xs"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ShopFilterBar({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const chips: { key: string; label: string }[] = [];
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const audience = searchParams.get("audience");
  const material = searchParams.get("material");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock");

  if (q) chips.push({ key: "q", label: `“${q}”` });
  if (category) {
    const cat = categories.find((c) => c.slug === category);
    chips.push({ key: "category", label: cat?.name ?? category });
  }
  if (audience) chips.push({ key: "audience", label: audience });
  if (material) chips.push({ key: "material", label: material });
  if (minPrice)
    chips.push({
      key: "minPrice",
      label: `Min ₹${paiseToRupees(Number(minPrice))}`,
    });
  if (maxPrice)
    chips.push({
      key: "maxPrice",
      label: `Max ₹${paiseToRupees(Number(maxPrice))}`,
    });
  if (inStock === "true") chips.push({ key: "inStock", label: "In stock" });

  if (chips.length === 0) return null;

  function remove(key: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => remove(chip.key)}
          className="inline-flex items-center gap-1 border border-[var(--color-champagne)] bg-white px-2.5 py-1 text-xs"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <Link
        href={pathname}
        className="text-xs text-[var(--color-rose-gold)] underline-offset-2 hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
