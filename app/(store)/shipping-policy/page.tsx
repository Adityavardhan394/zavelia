import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose-sm">
      <h1 className="font-heading text-4xl">Shipping Policy</h1>
      <p className="mt-6 text-[var(--color-espresso)]/80">
        Orders of ₹300 and above qualify for free shipping within India. Orders below
        ₹300 include a standard shipping charge of ₹49. Shipping timelines are confirmed
        on WhatsApp after your order is reviewed.
      </p>
      <p className="mt-4 text-[var(--color-espresso)]/80">
        Please ensure your delivery details are accurate at checkout. Stock is reserved
        for 30 minutes while your WhatsApp order awaits confirmation.
      </p>
    </article>
  );
}
