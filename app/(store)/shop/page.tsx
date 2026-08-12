import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/store/product-grid";
import {
  ProductFilters,
  ShopFilterBar,
} from "@/components/store/product-filters";
import { EmptyState } from "@/components/store/empty-state";
import {
  firstParam,
  parseAudience,
  safeListCategories,
  safeListProducts,
} from "@/lib/store/safe-queries";
import type { ProductListParams } from "@/lib/products/queries";

export const metadata = {
  title: "Shop",
  description: "Browse the ZAVÉLIA jewellery collection.",
};

type Search = Record<string, string | string[] | undefined>;

function buildParams(sp: Search): ProductListParams {
  const sort = firstParam(sp.sort) as ProductListParams["sort"];
  const page = Number(firstParam(sp.page) ?? "1") || 1;
  const minPrice = firstParam(sp.minPrice);
  const maxPrice = firstParam(sp.maxPrice);
  const audience = parseAudience(sp.audience);
  const newArrival = firstParam(sp.newArrival) === "true";
  const bestSeller = firstParam(sp.bestSeller) === "true";

  return {
    q: firstParam(sp.q),
    category: firstParam(sp.category),
    audience,
    material: firstParam(sp.material),
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock: firstParam(sp.inStock) === "true" ? true : undefined,
    newArrival: newArrival || undefined,
    bestSeller: bestSeller || undefined,
    sort: sort || "featured",
    page,
    pageSize: 12,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const params = buildParams(sp);
  const [result, categories] = await Promise.all([
    safeListProducts(params),
    safeListCategories(),
  ]);

  const categoryOptions = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl">
          Shop
        </h1>
        <p className="mt-2 text-sm text-[var(--color-espresso)]/65">
          {result.total} piece{result.total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <Suspense fallback={<div className="h-40 animate-pulse bg-[var(--color-champagne)]/30" />}>
            <ProductFilters categories={categoryOptions} />
          </Suspense>
        </aside>

        <div>
          <Suspense fallback={null}>
            <ShopFilterBar categories={categoryOptions} />
          </Suspense>

          <details className="mb-6 border border-[var(--color-champagne)] bg-white/60 p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium">
              Filters & sort
            </summary>
            <div className="mt-4">
              <Suspense fallback={<ProductGridSkeleton count={4} />}>
                <ProductFilters categories={categoryOptions} />
              </Suspense>
            </div>
          </details>

          {result.items.length === 0 ? (
            <EmptyState
              title="No pieces found"
              description="Try clearing filters or explore another category."
              actionHref="/shop"
              actionLabel="Clear filters"
            />
          ) : (
            <ProductGrid products={result.items} />
          )}

          {result.totalPages > 1 ? (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              searchParams={sp}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Search;
}) {
  function hrefFor(p: number) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      const v = Array.isArray(value) ? value[0] : value;
      if (v) next.set(key, v);
    }
    next.set("page", String(p));
    return `/shop?${next.toString()}`;
  }

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-3"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="border border-[var(--color-champagne)] px-4 py-2 text-sm"
        >
          Previous
        </Link>
      ) : null}
      <span className="text-sm text-[var(--color-espresso)]/70">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className="border border-[var(--color-champagne)] px-4 py-2 text-sm"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
