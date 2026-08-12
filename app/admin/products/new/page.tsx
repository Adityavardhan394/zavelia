import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="admin-brand text-2xl">New product</h1>
      <p className="text-sm text-[var(--color-espresso)]/60">
        Create a product with at least one variant. Images upload via signed
        Cloudinary requests, or paste a URL if upload fails.
      </p>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
