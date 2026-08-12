import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api";
import { availableStock } from "@/lib/utils/stock";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const q = new URL(request.url).searchParams.get("q") || undefined;
  const variants = await prisma.productVariant.findMany({
    where: q
      ? {
          OR: [
            { sku: { contains: q, mode: "insensitive" } },
            { product: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return ok(
    variants.map((v) => ({
      ...v,
      available: availableStock(v.stockOnHand, v.stockReserved),
    })),
  );
}

export async function POST() {
  return fail("Use /api/admin/inventory/adjust", { status: 405 });
}
