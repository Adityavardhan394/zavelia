import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const email = process.env.BUSINESS_SUPPORT_EMAIL || "hello@zavelia.store";
  const phone = process.env.BUSINESS_SUPPORT_PHONE || "";
  const address = process.env.BUSINESS_ADDRESS || "India";

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl">Contact</h1>
      <p className="mt-4 text-[var(--color-espresso)]/80">
        We are here for order questions, styling help, and aftercare guidance.
      </p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium">Email</dt>
          <dd>
            <a className="text-[var(--color-rose-gold)]" href={`mailto:${email}`}>
              {email}
            </a>
          </dd>
        </div>
        {phone ? (
          <div>
            <dt className="font-medium">Phone / WhatsApp</dt>
            <dd>{phone}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium">Address</dt>
          <dd className="whitespace-pre-wrap">{address}</dd>
        </div>
      </dl>
    </article>
  );
}
