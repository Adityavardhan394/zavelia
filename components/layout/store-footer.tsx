import Image from "next/image";
import Link from "next/link";

const SHOP_LINKS = [
  { href: "/shop", label: "All Jewellery" },
  { href: "/shop?audience=WOMEN", label: "Women" },
  { href: "/shop?audience=MEN", label: "Men" },
  { href: "/shop?audience=GIRLS", label: "Girls" },
  { href: "/shop?newArrival=true", label: "New Arrivals" },
  { href: "/shop?bestSeller=true", label: "Best Sellers" },
];

const HELP_LINKS = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/returns-policy", label: "Returns & Exchanges" },
  { href: "/contact", label: "Contact Us" },
  { href: "/about", label: "About ZAVÉLIA" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-champagne)] bg-[var(--color-espresso)] text-[var(--color-ivory)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4 md:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/zavelia-logo.png"
              alt="ZAVÉLIA"
              width={160}
              height={48}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <p className="font-[family-name:var(--font-heading)] text-xl italic text-[var(--color-champagne)]">
            Elegance For Every You
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--color-ivory)]/70">
            Thoughtfully crafted jewellery for women, men, and girls — designed
            to feel personal, lasting, and quietly luxurious.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg tracking-wide">
            Shop
          </h3>
          <ul className="space-y-2.5 text-sm text-[var(--color-ivory)]/75">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-[var(--color-champagne)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg tracking-wide">
            Help
          </h3>
          <ul className="space-y-2.5 text-sm text-[var(--color-ivory)]/75">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-[var(--color-champagne)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg tracking-wide">
            Policies
          </h3>
          <ul className="space-y-2.5 text-sm text-[var(--color-ivory)]/75">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-[var(--color-champagne)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-[var(--color-ivory)]/50">
            Orders are confirmed via WhatsApp. Free shipping on ₹300+.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-[var(--color-ivory)]/50 sm:px-6">
        © {new Date().getFullYear()} ZAVÉLIA. All rights reserved.
      </div>
    </footer>
  );
}
