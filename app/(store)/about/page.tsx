import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl">About ZAVÉLIA</h1>
      <p className="mt-4 text-lg text-[var(--color-rose-gold)]">
        Elegance For Every You
      </p>
      <p className="mt-6 leading-relaxed text-[var(--color-espresso)]/80">
        ZAVÉLIA creates jewellery and fashion accessories for women, men, girls, and
        boys — pieces meant to feel personal, polished, and wearable every day. We
        believe elegance is not a single look; it is the confidence of choosing what
        suits you.
      </p>
      <p className="mt-4 leading-relaxed text-[var(--color-espresso)]/80">
        Browse the collection online, reserve your favourites, and complete your order
        through WhatsApp with a clear summary and dedicated support.
      </p>
    </article>
  );
}
