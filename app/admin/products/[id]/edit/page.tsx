import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { createdAt: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="admin-brand text-2xl">Edit product</h1>
      <p className="text-sm text-[var(--color-espresso)]/60">
        Editing <span className="font-medium">{product.name}</span>
      </p>
      <ProductForm
        mode="edit"
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          shortDescription: product.shortDescription,
          description: product.description,
          material: product.material,
          careInstructions: product.careInstructions,
          audience: product.audience,
          categoryId: product.categoryId,
          priceInPaise: product.priceInPaise,
          compareAtPriceInPaise: product.compareAtPriceInPaise,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isBestSeller: product.isBestSeller,
          isActive: product.isActive,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            value: v.value,
            sku: v.sku,
            priceAdjustmentInPaise: v.priceAdjustmentInPaise,
            stockOnHand: v.stockOnHand,
            lowStockThreshold: v.lowStockThreshold,
            isActive: v.isActive,
          })),
          images: product.images.map((img) => ({
            url: img.url,
            altText: img.altText ?? undefined,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
        }}
      />
    </div>
  );
}
