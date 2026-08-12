import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { SettingsClient } from "@/components/admin/settings-client";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {},
    });
  }

  return <SettingsClient settings={settings} />;
}
