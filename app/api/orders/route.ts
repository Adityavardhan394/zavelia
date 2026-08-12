import {
  createOrderFromCheckout,
  OrderServiceError,
} from "@/lib/orders/create-order";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { createOrderSchema } from "@/lib/validations";
import { created, fail } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid order payload", {
        status: 400,
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const ip = getClientIp(request.headers);
    const phone = parsed.data.address.phone;
    const limited = rateLimit({
      key: `order:${ip}:${phone}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.success) {
      return fail("Too many order attempts. Please try again later.", {
        status: 429,
        code: "RATE_LIMITED",
        details: { retryAfterMs: limited.retryAfterMs },
      });
    }

    const result = await createOrderFromCheckout(parsed.data);
    const { order, whatsappUrl } = result;

    return created({
      orderNumber: order.orderNumber,
      publicToken: order.publicToken,
      orderId: order.id,
      whatsappUrl,
      reused: result.reused,
      totals: {
        subtotalInPaise: order.subtotalInPaise,
        discountInPaise: order.discountInPaise,
        shippingInPaise: order.shippingInPaise,
        totalInPaise: order.totalInPaise,
      },
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return fail(error.message, {
        status: error.code === "NOT_FOUND" ? 404 : 400,
        code: error.code,
      });
    }
    console.error("[POST /api/orders]", error);
    return fail("Failed to create order", {
      status: 500,
      code: "INTERNAL_ERROR",
    });
  }
}
