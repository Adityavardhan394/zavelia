"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  title?: string;
  user: { name: string; email: string };
  onMenuClick?: () => void;
};

export function AdminHeader({
  title = "Admin",
  user,
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="admin-no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--admin-border)] bg-[#fffefb]/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="admin-brand text-xl leading-none text-[var(--color-espresso)]">
            {title}
          </h1>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-espresso)]/45">
            ZAVÉLIA Console
          </p>
        </div>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-[var(--color-espresso)]">
          {user.name}
        </p>
        <p className="text-xs text-[var(--color-espresso)]/50">{user.email}</p>
      </div>
    </header>
  );
}
