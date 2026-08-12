import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { CategoriesClient } from "@/components/admin/categories-client";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return <CategoriesClient categories={categories} />;
}
