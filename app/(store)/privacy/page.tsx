import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl">Privacy Policy</h1>
      <p className="mt-6 text-[var(--color-espresso)]/80">
        ZAVÉLIA collects only the information needed to fulfil your order: name, phone,
        delivery address, and optional email. We do not sell personal data. Order details
        are shared with our team for fulfilment and may appear in the WhatsApp message you
        send to our business number.
      </p>
      <p className="mt-4 text-[var(--color-espresso)]/80">
        Admin access is restricted to authorised staff. Payment confirmation is handled
        manually and is never assumed from opening WhatsApp alone.
      </p>
    </article>
  );
}
