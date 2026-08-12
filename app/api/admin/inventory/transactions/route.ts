import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get("variantId") || undefined;
  const type = searchParams.get("type") || undefined;

  const items = await prisma.inventoryTransaction.findMany({
    where: {
      ...(variantId ? { variantId } : {}),
      ...(type ? { type: type as never } : {}),
    },
    include: {
      variant: { include: { product: { select: { name: true } } } },
      performedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(items);
}
