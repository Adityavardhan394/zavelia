import { prisma } from "@/lib/db/prisma";
import { buildOrderWhatsAppUrl } from "@/lib/orders/create-order";
import { fail, ok } from "@/lib/utils/api";

type Params = { params: Promise<{ id: string }> };

/** Param `id` is the order publicToken (route: /api/orders/[publicToken]). */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id: publicToken } = await params;
    const order = await prisma.order.findUnique({
      where: { publicToken },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    if (!order) {
      return fail("Order not found", { status: 404, code: "NOT_FOUND" });
    }

    return ok({
      ...order,
      whatsappUrl: buildOrderWhatsAppUrl(order),
    });
  } catch (error) {
    console.error("[GET /api/orders/[publicToken]]", error);
    return fail("Failed to load order", {
      status: 500,
      code: "INTERNAL_ERROR",
    });
  }
}
