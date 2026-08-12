import { requireAdmin } from "@/lib/auth";
import { paymentStatusSchema } from "@/lib/validations";
import { updatePaymentStatus } from "@/lib/orders/create-order";
import { fail, ok } from "@/lib/utils/api";
import { createAuditLog } from "@/lib/security/audit";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const { id } = await context.params;
  const parsed = paymentStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail("Invalid payment status", { status: 400 });
  }
  const order = await updatePaymentStatus({
    orderId: id,
    paymentStatus: parsed.data.paymentStatus,
  });
  await createAuditLog({
    userId: admin.id,
    action: "ORDER_PAYMENT_UPDATE",
    entityType: "Order",
    entityId: id,
    metadata: parsed.data,
  });
  return ok(order);
}
