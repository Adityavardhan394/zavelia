import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/queries";
import { absoluteUrl } from "@/lib/utils/cn";
import { availableStock } from "@/lib/utils/stock";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductGrid } from "@/components/store/product-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Product" };
    return {
      title: product.seoTitle || product.name,
      description:
        product.seoDescription ||
        product.shortDescription ||
        `Shop ${product.name} at ZAVÉLIA`,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  type ProductDetail = NonNullable<
    Awaited<ReturnType<typeof getProductBySlug>>
  >;
  let product: ProductDetail | null;
  try {
    product = await getProductBySlug(slug);
  } catch {
    product = null;
  }
  if (!product) notFound();

  let related: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  try {
    related = await getRelatedProducts(product.id, product.categoryId, 4);
  } catch {
    related = [];
  }

  const stockTotal = product.variants.reduce(
    (sum: number, v: ProductDetail["variants"][number]) =>
      sum + availableStock(v.stockOnHand, v.stockReserved),
    0,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    sku: product.sku,
    image: product.images.map((i: ProductDetail["images"][number]) => i.url),
    brand: { "@type": "Brand", name: "ZAVÉLIA" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "INR",
      price: (product.priceInPaise / 100).toFixed(2),
      availability:
        stockTotal > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav className="mb-6 text-xs text-[var(--color-espresso)]/55">
        <Link href="/shop" className="hover:text-[var(--color-rose-gold)]">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/category/${product.category.slug}`}
          className="hover:text-[var(--color-rose-gold)]"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-espresso)]">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductPurchase product={product} />
      </div>

      {product.description ? (
        <section className="mt-16 max-w-3xl">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">
            Details
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-espresso)]/75">
            {product.description}
          </p>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-8 font-[family-name:var(--font-heading)] text-3xl">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
