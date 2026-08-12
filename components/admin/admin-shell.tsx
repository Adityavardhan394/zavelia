"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "New product",
  "/admin/categories": "Categories",
  "/admin/inventory": "Inventory",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/settings": "Settings",
};

function resolveTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.includes("/products/") && pathname.endsWith("/edit")) {
    return "Edit product";
  }
  if (pathname.startsWith("/admin/orders/")) return "Order detail";
  return "Admin";
}

type AdminShellProps = {
  user?: { name: string; email: string } | null;
  children: React.ReactNode;
};

/** Client wrapper: login renders plain; all other admin routes get sidebar + main. */
export function AdminShellWrapper({ user = null, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const isLogin = pathname === "/admin/login";

  if (pathname !== menuPath) {
    setMenuPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  if (isLogin) {
    return <div className="admin-root min-h-screen">{children}</div>;
  }

  return (
    <div className="admin-root min-h-screen lg:flex">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-[var(--color-espresso)]/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <AdminSidebar
        user={user}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader
          title={resolveTitle(pathname)}
          user={user ?? { name: "Admin", email: "" }}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminShell(props: AdminShellProps) {
  return <AdminShellWrapper {...props} />;
}
