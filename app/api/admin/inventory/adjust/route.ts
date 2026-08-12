import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { inventoryAdjustSchema } from "@/lib/validations";
import { adjustStock } from "@/lib/inventory/reservations";
import { fail, ok } from "@/lib/utils/api";
import { createAuditLog } from "@/lib/security/audit";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const parsed = inventoryAdjustSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail("Invalid adjustment", {
      status: 400,
      details: parsed.error.flatten(),
    });
  }

  try {
    const result = await prisma.$transaction((tx) =>
      adjustStock(tx, {
        ...parsed.data,
        performedByUserId: admin.id,
      }),
    );
    await createAuditLog({
      userId: admin.id,
      action: "INVENTORY_ADJUST",
      entityType: "ProductVariant",
      entityId: parsed.data.variantId,
      metadata: parsed.data,
    });
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Adjust failed", {
      status: 400,
    });
  }
}
