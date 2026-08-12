import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl">Terms of Service</h1>
      <p className="mt-6 text-[var(--color-espresso)]/80">
        By placing an order on ZAVÉLIA you agree that prices are calculated on our
        servers, inventory may be reserved pending confirmation, and unconfirmed WhatsApp
        orders may expire after 30 minutes. Product colours may vary slightly from screen
        displays.
      </p>
      <p className="mt-4 text-[var(--color-espresso)]/80">
        We reserve the right to cancel orders in cases of pricing errors, stock issues, or
        suspected fraud, with reserved stock released accordingly.
      </p>
    </article>
  );
}
