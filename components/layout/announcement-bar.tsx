import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-[var(--color-espresso)] px-4 py-2 text-center text-xs tracking-[0.12em] text-[var(--color-ivory)] sm:text-sm">
      <p>
        FREE shipping on orders of ₹300+ ·{" "}
        <Link
          href="/shipping-policy"
          className="underline decoration-[var(--color-rose-gold)] underline-offset-2 transition hover:text-[var(--color-champagne)]"
        >
          See shipping details
        </Link>
      </p>
    </div>
  );
}
