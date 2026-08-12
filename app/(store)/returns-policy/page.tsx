import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns Policy" };

export default function ReturnsPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl">Returns Policy</h1>
      <p className="mt-6 text-[var(--color-espresso)]/80">
        If an item arrives damaged or incorrect, contact us within 48 hours of delivery
        with your order number and photos. Eligible returns are reviewed case by case.
        Earrings and intimate accessories may be non-returnable for hygiene reasons once
        opened.
      </p>
    </article>
  );
}
