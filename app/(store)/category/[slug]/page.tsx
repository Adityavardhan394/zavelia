import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/product-grid";
import { EmptyState } from "@/components/store/empty-state";
import { getCategoryBySlug, listProducts } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await listProducts({ category: slug, pageSize: 24 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl">{category.name}</h1>
      {category.description ? (
        <p className="mt-2 max-w-2xl text-[var(--color-espresso)]/70">
          {category.description}
        </p>
      ) : null}
      <div className="mt-8">
        {result.items.length === 0 ? (
          <EmptyState
            title="No products in this category yet"
            description="Please check back soon or browse the full shop."
          />
        ) : (
          <ProductGrid products={result.items} />
        )}
      </div>
    </div>
  );
}
