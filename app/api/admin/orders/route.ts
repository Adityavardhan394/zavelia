import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const status = searchParams.get("status") as OrderStatus | null;
  const paymentStatus = searchParams.get("paymentStatus") as PaymentStatus | null;
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Math.min(50, Number(searchParams.get("pageSize") || "20"));

  const where = {
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { customer: { name: { contains: q, mode: "insensitive" as const } } },
            { customer: { phone: { contains: q } } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return ok({ items, total, page, pageSize });
}
