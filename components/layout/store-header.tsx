"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?audience=WOMEN", label: "Women" },
  { href: "/shop?audience=MEN", label: "Men" },
  { href: "/shop?audience=GIRLS", label: "Girls" },
  { href: "/shop?newArrival=true", label: "New Arrivals" },
  { href: "/shop?bestSeller=true", label: "Best Sellers" },
] as const;

export function StoreHeader() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (pathname !== menuPath) {
    setMenuPath(pathname);
    if (open) setOpen(false);
    if (searchOpen) setSearchOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[var(--color-champagne)]/60 bg-[var(--color-ivory)]/95 backdrop-blur-md transition-shadow",
        scrolled && "shadow-[0_8px_30px_rgba(53,37,31,0.06)]",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="ZAVÉLIA home"
        >
          <Image
            src="/brand/zavelia-logo.png"
            alt="ZAVÉLIA"
            width={140}
            height={40}
            className="h-8 w-auto object-contain sm:h-9"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-2 text-sm tracking-wide text-[var(--color-espresso)]/80 transition hover:text-[var(--color-rose-gold)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden sm:inline-flex"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link
            href="/search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-espresso)] hover:bg-[var(--color-ivory)] sm:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-espresso)] transition hover:bg-[var(--color-champagne)]/40"
            aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-rose-gold)] px-1 text-[10px] font-semibold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-[var(--color-champagne)]/50 bg-[var(--color-ivory)] px-4 py-3 sm:px-6 lg:px-8">
          <form action="/search" className="mx-auto flex max-w-7xl gap-2">
            <Input
              name="q"
              placeholder="Search jewellery…"
              autoFocus
              aria-label="Search products"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      ) : null}

      <div
        className={cn(
          "fixed inset-0 top-[calc(2.5rem+4rem)] z-40 bg-[var(--color-espresso)]/40 transition lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed left-0 top-[calc(2.5rem+4rem)] z-50 flex h-[calc(100dvh-2.5rem-4rem)] w-[min(20rem,88vw)] flex-col gap-1 overflow-y-auto border-r border-[var(--color-champagne)] bg-[var(--color-ivory)] p-5 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
      >
        <p className="mb-3 font-[family-name:var(--font-heading)] text-2xl text-[var(--color-espresso)]">
          Menu
        </p>
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="border-b border-[var(--color-champagne)]/50 py-3 text-base tracking-wide text-[var(--color-espresso)]"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/about"
          className="border-b border-[var(--color-champagne)]/50 py-3 text-base"
          onClick={() => setOpen(false)}
        >
          About
        </Link>
        <Link
          href="/contact"
          className="py-3 text-base"
          onClick={() => setOpen(false)}
        >
          Contact
        </Link>
      </aside>
    </header>
  );
}
