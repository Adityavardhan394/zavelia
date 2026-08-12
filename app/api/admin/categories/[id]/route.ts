import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { getClientIp } from "@/lib/security/rate-limit";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils/cn";
import { fail, ok } from "@/lib/utils/api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  }

  try {
    const { id } = await params;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return fail("Category not found", { status: 404, code: "NOT_FOUND" });
    }

    const body = await request.json().catch(() => null);
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return fail("Invalid category payload", {
        status: 400,
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name != null ? { name: data.name } : {}),
        ...(data.slug != null || data.name != null
          ? {
              slug:
                data.slug?.trim() ||
                slugify(data.name ?? existing.name),
            }
          : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.imageUrl !== undefined
          ? { imageUrl: data.imageUrl || null }
          : {}),
        ...(data.audience != null ? { audience: data.audience } : {}),
        ...(data.sortOrder != null ? { sortOrder: data.sortOrder } : {}),
        ...(data.isActive != null ? { isActive: data.isActive } : {}),
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: "CATEGORY_UPDATE",
      entityType: "Category",
      entityId: category.id,
      ipAddress: getClientIp(request.headers),
    });

    revalidateTag("categories", "max");
    revalidatePath("/");
    return ok(category);
  } catch (error) {
    console.error("[PATCH /api/admin/categories/[id]]", error);
    return fail("Failed to update category", {
      status: 500,
      code: "INTERNAL_ERROR",
    });
  }
}
