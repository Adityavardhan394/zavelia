import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const customers = await prisma.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return ok(customers);
}
