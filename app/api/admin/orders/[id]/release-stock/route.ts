import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { releaseOrderStock } from "@/lib/inventory/reservations";
import { fail, ok } from "@/lib/utils/api";
import { createAuditLog } from "@/lib/security/audit";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const { id } = await context.params;

  try {
    const result = await prisma.$transaction((tx) =>
      releaseOrderStock(tx, {
        orderId: id,
        reason: "Manual stock release by admin",
        performedByUserId: admin.id,
      }),
    );
    await createAuditLog({
      userId: admin.id,
      action: "ORDER_STOCK_RELEASE",
      entityType: "Order",
      entityId: id,
      metadata: result,
    });
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Release failed", {
      status: 400,
    });
  }
}
