import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  ProductsClient,
  type ProductListItem,
} from "@/components/admin/products-client";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const products = (await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, isPrimary: true },
      },
      _count: { select: { variants: true } },
    },
  })) as ProductListItem[];

  return <ProductsClient products={products} />;
}
