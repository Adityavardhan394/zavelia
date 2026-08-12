import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { productCreateSchema } from "@/lib/validations";
import { created, fail, ok } from "@/lib/utils/api";
import { slugify } from "@/lib/utils/cn";
import { createAuditLog } from "@/lib/security/audit";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Math.min(50, Number(searchParams.get("pageSize") || "20"));

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return ok({ items, total, page, pageSize });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });

  const body = await request.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldMessages = Object.entries(flat.fieldErrors)
      .flatMap(([field, messages]) =>
        (messages ?? []).map((message) => `${field}: ${message}`),
      )
      .concat(flat.formErrors);
    return fail(
      fieldMessages[0] ?? "Invalid product data",
      {
        status: 400,
        code: "VALIDATION_ERROR",
        details: flat,
      },
    );
  }

  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku: data.sku,
        shortDescription: data.shortDescription,
        description: data.description,
        material: data.material,
        careInstructions: data.careInstructions,
        audience: data.audience,
        categoryId: data.categoryId,
        priceInPaise: data.priceInPaise,
        compareAtPriceInPaise: data.compareAtPriceInPaise ?? null,
        isFeatured: data.isFeatured ?? false,
        isNewArrival: data.isNewArrival ?? false,
        isBestSeller: data.isBestSeller ?? false,
        isActive: data.isActive ?? true,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        variants: {
          create: data.variants.map((v) => ({
            name: v.name,
            value: v.value,
            sku: v.sku,
            priceAdjustmentInPaise: v.priceAdjustmentInPaise ?? 0,
            stockOnHand: v.stockOnHand ?? 0,
            lowStockThreshold: v.lowStockThreshold ?? 5,
            isActive: v.isActive ?? true,
          })),
        },
        images: data.images
          ? {
              create: data.images.map((img, index) => ({
                url: img.url,
                altText: img.altText,
                sortOrder: img.sortOrder ?? index,
                isPrimary: img.isPrimary ?? index === 0,
              })),
            }
          : undefined,
      },
      include: { variants: true, images: true, category: true },
    });

    await createAuditLog({
      userId: admin.id,
      action: "PRODUCT_CREATE",
      entityType: "Product",
      entityId: product.id,
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/admin/products");
    revalidateTag("products", "max");

    return created(product);
  } catch {
    console.error("Product create failed");
    return fail("Unable to create product", {
      status: 500,
      code: "SERVER_ERROR",
    });
  }
}
