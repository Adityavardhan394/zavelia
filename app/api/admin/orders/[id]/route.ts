import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api";
import { buildOrderWhatsAppUrl } from "@/lib/orders/create-order";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!order) return fail("Not found", { status: 404, code: "NOT_FOUND" });
  return ok({ ...order, whatsappUrl: buildOrderWhatsAppUrl(order) });
}
