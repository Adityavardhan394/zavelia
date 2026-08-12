"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type AdminSidebarProps = {
  user?: { name: string; email: string } | null;
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({
  user,
  mobileOpen = false,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // still send the user to login
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "admin-no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[var(--admin-sidebar)] text-[var(--color-ivory)] transition-transform lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <Image
          src="/brand/zavelia-logo.png"
          alt="ZAVÉLIA"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full bg-[var(--color-ivory)] object-contain p-1"
        />
        <div className="min-w-0">
          <p className="admin-brand text-lg leading-none tracking-wide">ZAVÉLIA</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--admin-sidebar-muted)]">
            Admin
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--color-rose-gold)] text-white"
                  : "text-[var(--admin-sidebar-muted)] hover:bg-white/8 hover:text-[var(--color-ivory)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {user ? (
          <div className="mb-2 truncate px-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-[var(--admin-sidebar-muted)]">
              {user.email}
            </p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--admin-sidebar-muted)] transition-colors hover:bg-white/8 hover:text-[var(--color-ivory)]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
