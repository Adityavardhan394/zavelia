import { markWhatsAppOpened } from "@/lib/orders/create-order";
import { fail, ok } from "@/lib/utils/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const order = await markWhatsAppOpened(id);
    return ok({
      id: order.id,
      whatsappOpenedAt: order.whatsappOpenedAt,
    });
  } catch (error) {
    console.error("[POST /api/orders/[id]/whatsapp-opened]", error);
    return fail("Failed to mark WhatsApp opened", {
      status: 404,
      code: "NOT_FOUND",
    });
  }
}
