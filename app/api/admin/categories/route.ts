import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { categorySchema } from "@/lib/validations";
import { created, fail, ok } from "@/lib/utils/api";
import { slugify } from "@/lib/utils/cn";
import { createAuditLog } from "@/lib/security/audit";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const categories = await prisma.category.findMany({
    orderBy: [{ audience: "asc" }, { sortOrder: "asc" }],
  });
  return ok(categories);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail("Invalid category", {
      status: 400,
      details: parsed.error.flatten(),
    });
  }
  const slug = parsed.data.slug
    ? slugify(parsed.data.slug)
    : slugify(`${parsed.data.name}-${parsed.data.audience}`);
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      audience: parsed.data.audience,
      sortOrder: parsed.data.sortOrder ?? 0,
      isActive: parsed.data.isActive ?? true,
    },
  });
  await createAuditLog({
    userId: admin.id,
    action: "CATEGORY_CREATE",
    entityType: "Category",
    entityId: category.id,
  });
  return created(category);
}
