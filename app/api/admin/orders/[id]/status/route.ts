import { requireAdmin } from "@/lib/auth";
import { orderStatusSchema } from "@/lib/validations";
import { updateOrderStatus, OrderServiceError } from "@/lib/orders/create-order";
import { fail, ok } from "@/lib/utils/api";
import { createAuditLog } from "@/lib/security/audit";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const { id } = await context.params;
  const parsed = orderStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail("Invalid status", { status: 400, details: parsed.error.flatten() });
  }

  try {
    const order = await updateOrderStatus({
      orderId: id,
      status: parsed.data.status,
      adminNotes: parsed.data.adminNotes,
      performedByUserId: admin.id,
    });
    await createAuditLog({
      userId: admin.id,
      action: "ORDER_STATUS_UPDATE",
      entityType: "Order",
      entityId: id,
      metadata: parsed.data,
    });
    return ok(order);
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return fail(error.message, { status: 400, code: error.code });
    }
    return fail("Unable to update status", { status: 500 });
  }
}
