import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/store/product-grid";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { EmptyState } from "@/components/store/empty-state";
import {
  safeListCategories,
  safeListProducts,
  type SafeCategory,
} from "@/lib/store/safe-queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    absolute: "ZAVÉLIA | Elegance For Every You",
  },
  description:
    "Minimal jewellery and accessories for every you. Free shipping on orders of ₹300 and above.",
};

const VALUES = [
  { title: "Timeless Design", body: "Quiet pieces made to live with you." },
  { title: "Premium Quality", body: "Careful finishes. Honest materials." },
  { title: "For Every Style", body: "Her, him, and every shared moment." },
  { title: "Made To Last", body: "Designed for everyday wear." },
] as const;

export default async function HomePage() {
  const [newArrivals, categories] = await Promise.all([
    safeListProducts({ newArrival: true, pageSize: 8, sort: "newest" }),
    safeListCategories(),
  ]);

  const categoryLinks = categories.slice(0, 8);
  const gallery = newArrivals.items
    .map((p) => {
      const img = p.images.find((i) => i.isPrimary) ?? p.images[0] ?? null;
      return img
        ? {
            href: `/product/${p.slug}`,
            src: img.url,
            alt: img.altText || p.name,
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 4) as Array<{ href: string; src: string; alt: string }>;

  return (
    <div className="text-[#161616]">
      <section className="relative overflow-hidden border-b border-[#E8D1BA]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(232,209,186,0.45), transparent 55%), linear-gradient(180deg, #FAF7F2 0%, #F7EFE5 55%, #F0E6DA 100%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[72vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#6B7280]">
            Jewellery &amp; accessories
          </p>
          <h1 className="mt-6 font-[family-name:var(--font-heading)] text-5xl font-medium tracking-[0.12em] text-[#111827] sm:text-6xl md:text-7xl">
            ZAVÉLIA
          </h1>
          <p className="mt-5 max-w-md font-[family-name:var(--font-heading)] text-xl italic text-[#374151] sm:text-2xl">
            Elegance For Every You
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#4B5563]">
            Refined pieces for women, men, girls, and boys — ordered simply on
            WhatsApp.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#161616] px-8 text-base font-medium text-white hover:bg-[#35251F]"
            >
              Shop the collection
            </Link>
            <Link
              href="/shop?audience=WOMEN"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[#161616] bg-transparent px-8 text-base font-medium text-[#161616] hover:bg-[#F7EFE5]"
            >
              For her
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl md:grid-cols-2">
        <Link
          href="/shop?audience=WOMEN"
          className="group border-b border-[#E8D1BA] px-8 py-20 text-center transition hover:bg-white md:border-r"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#6B7280]">
            Collection
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl tracking-wide text-[#111827] sm:text-4xl">
            For Her
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-sm text-[#4B5563]">
            Earrings, necklaces, sets, and finishing touches.
          </p>
          <span className="mt-8 inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#161616] underline-offset-4 group-hover:underline">
            Explore
          </span>
        </Link>
        <Link
          href="/shop?audience=MEN"
          className="group border-b border-[#E8D1BA] px-8 py-20 text-center transition hover:bg-white"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#6B7280]">
            Collection
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl tracking-wide text-[#111827] sm:text-4xl">
            For Him
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-sm text-[#4B5563]">
            Chains, rings, bracelets, and refined essentials.
          </p>
          <span className="mt-8 inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#161616] underline-offset-4 group-hover:underline">
            Explore
          </span>
        </Link>
      </section>

      <section className="border-b border-[#E8D1BA] py-14">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl tracking-wide text-[#111827] sm:text-3xl">
            Shop by category
          </h2>
          {categoryLinks.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="Categories coming soon"
                description="We're preparing the collection."
              />
            </div>
          ) : (
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {categoryLinks.map((cat: SafeCategory) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm font-medium tracking-wide text-[#374151] transition hover:text-[#111827]"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl tracking-wide text-[#111827] sm:text-3xl">
                New arrivals
              </h2>
              <p className="mt-2 text-sm text-[#4B5563]">
                Fresh pieces for the season.
              </p>
            </div>
            <Link
              href="/shop?newArrival=true"
              className="text-xs font-medium uppercase tracking-[0.18em] text-[#374151] hover:text-[#111827]"
            >
              View all
            </Link>
          </div>
          {newArrivals.items.length === 0 ? (
            <EmptyState
              title="Nothing here yet"
              description="New pieces will appear as the catalogue grows."
            />
          ) : (
            <ProductGrid products={newArrivals.items} />
          )}
        </div>
      </section>

      <section className="border-y border-[#E8D1BA] bg-white py-12 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#6B7280]">
          Delivery
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl text-[#111827] sm:text-3xl">
          Free shipping on ₹300 and above
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#4B5563]">
          Below ₹300, standard shipping is ₹49.
        </p>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-[family-name:var(--font-heading)] text-2xl tracking-wide text-[#111827] sm:text-3xl">
            Why ZAVÉLIA
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="text-center sm:text-left">
                <div className="mx-auto mb-4 h-px w-8 bg-[#B88968] sm:mx-0" />
                <h3 className="font-[family-name:var(--font-heading)] text-lg text-[#111827]">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E8D1BA] bg-[#F7EFE5] py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-[#111827] sm:text-3xl">
            Order on WhatsApp
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#4B5563]">
            Add to bag, share delivery details, and we open WhatsApp with your
            order summary. Nothing is marked paid until we confirm with you.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md border border-[#161616] bg-transparent px-5 text-sm font-medium text-[#161616] hover:bg-white"
          >
            Begin shopping
          </Link>
        </div>
      </section>

      {gallery.length > 0 ? (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center font-[family-name:var(--font-heading)] text-2xl tracking-wide text-[#111827] sm:text-3xl">
              The look
            </h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
              {gallery.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative aspect-square overflow-hidden bg-[#E8D1BA]/30"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    className="object-cover transition duration-500 hover:scale-[1.03]"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-[#E8D1BA] py-16">
        <div className="mx-auto max-w-md px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-[#111827] sm:text-3xl">
            Stay close
          </h2>
          <p className="mt-3 text-sm text-[#4B5563]">
            Occasional notes on new drops — never clutter.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
