import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { productUpdateSchema } from "@/lib/validations";
import { fail, ok } from "@/lib/utils/api";
import { slugify } from "@/lib/utils/cn";
import { createAuditLog } from "@/lib/security/audit";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });
  if (!product) return fail("Not found", { status: 404, code: "NOT_FOUND" });
  return ok(product);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldMessages = Object.entries(flat.fieldErrors)
      .flatMap(([field, messages]) =>
        (messages ?? []).map((message) => `${field}: ${message}`),
      )
      .concat(flat.formErrors);
    return fail(fieldMessages[0] ?? "Invalid product data", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: flat,
    });
  }

  const data = parsed.data;
  const { variants, images, slug, ...productFields } = data;

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...productFields,
          ...(slug ? { slug: slugify(slug) } : {}),
          compareAtPriceInPaise:
            productFields.compareAtPriceInPaise === undefined
              ? undefined
              : productFields.compareAtPriceInPaise,
        },
      });

      if (variants) {
        const existing = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true, sku: true },
        });
        const bySku = new Map(existing.map((v) => [v.sku, v.id]));
        const keepIds = new Set<string>();

        for (const v of variants) {
          const matchId = bySku.get(v.sku);
          if (matchId) {
            keepIds.add(matchId);
            await tx.productVariant.update({
              where: { id: matchId },
              data: {
                name: v.name,
                value: v.value,
                priceAdjustmentInPaise: v.priceAdjustmentInPaise ?? 0,
                stockOnHand: v.stockOnHand ?? 0,
                lowStockThreshold: v.lowStockThreshold ?? 5,
                isActive: v.isActive ?? true,
              },
            });
          } else {
            const created = await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                value: v.value,
                sku: v.sku,
                priceAdjustmentInPaise: v.priceAdjustmentInPaise ?? 0,
                stockOnHand: v.stockOnHand ?? 0,
                lowStockThreshold: v.lowStockThreshold ?? 5,
                isActive: v.isActive ?? true,
              },
            });
            keepIds.add(created.id);
          }
        }

        const removeIds = existing
          .filter((v) => !keepIds.has(v.id))
          .map((v) => v.id);
        if (removeIds.length) {
          await tx.productVariant.updateMany({
            where: { id: { in: removeIds } },
            data: { isActive: false },
          });
        }
      }

      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length) {
          await tx.productImage.createMany({
            data: images.map((img, index) => ({
              productId: id,
              url: img.url,
              altText: img.altText,
              sortOrder: img.sortOrder ?? index,
              isPrimary: img.isPrimary ?? index === 0,
            })),
          });
        }
      }

      return tx.product.findUniqueOrThrow({
        where: { id: updated.id },
        include: { images: true, variants: true, category: true },
      });
    });

    await createAuditLog({
      userId: admin.id,
      action: "PRODUCT_UPDATE",
      entityType: "Product",
      entityId: product.id,
      metadata: { fields: Object.keys(productFields), variants: !!variants, images: !!images },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/admin/products");
    revalidateTag("products", "max");

    return ok(product);
  } catch {
    return fail("Unable to update product", { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  const { id } = await context.params;

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return fail("Not found", { status: 404, code: "NOT_FOUND" });
    }

    await prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);
      if (variantIds.length) {
        await tx.inventoryTransaction.deleteMany({
          where: { variantId: { in: variantIds } },
        });
      }
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    await createAuditLog({
      userId: admin.id,
      action: "PRODUCT_DELETE",
      entityType: "Product",
      entityId: id,
      metadata: { slug: existing.slug, name: existing.name },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${existing.slug}`);
    revalidatePath("/admin/products");
    revalidateTag("products", "max");

    return ok({ id, deleted: true });
  } catch {
    return fail("Unable to delete product", { status: 500 });
  }
}
