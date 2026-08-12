import { Prisma, type Audience } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { availableStock } from "@/lib/utils/stock";

export type ProductListParams = {
  q?: string;
  category?: string;
  audience?: Audience | Audience[];
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sort?:
    | "featured"
    | "newest"
    | "price-asc"
    | "price-desc"
    | "best-selling";
  page?: number;
  pageSize?: number;
};

export async function listProducts(params: ProductListParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, params.pageSize ?? 12));
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { shortDescription: { contains: params.q, mode: "insensitive" } },
      { sku: { contains: params.q, mode: "insensitive" } },
      { material: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.category) {
    where.category = { slug: params.category, isActive: true };
  }
  if (params.audience) {
    where.audience = Array.isArray(params.audience)
      ? { in: params.audience }
      : params.audience;
  }
  if (params.material) {
    where.material = { contains: params.material, mode: "insensitive" };
  }
  if (params.minPrice != null || params.maxPrice != null) {
    where.priceInPaise = {};
    if (params.minPrice != null) where.priceInPaise.gte = params.minPrice;
    if (params.maxPrice != null) where.priceInPaise.lte = params.maxPrice;
  }
  if (params.featured) where.isFeatured = true;
  if (params.newArrival) where.isNewArrival = true;
  if (params.bestSeller) where.isBestSeller = true;

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (params.sort) {
    case "price-asc":
      orderBy = { priceInPaise: "asc" };
      break;
    case "price-desc":
      orderBy = { priceInPaise: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "best-selling":
      orderBy = { isBestSeller: "desc" };
      break;
    case "featured":
    default:
      orderBy = { isFeatured: "desc" };
      break;
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  let items = products.map((product) => {
    const stock = product.variants.reduce(
      (sum, v) => sum + availableStock(v.stockOnHand, v.stockReserved),
      0,
    );
    return { ...product, availableStock: stock };
  });

  if (params.inStock) {
    items = items.filter((p) => p.availableStock > 0);
  }

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
    },
  });
  return product;
}

export async function listCategories(audience?: Audience) {
  return prisma.category.findMany({
    where: {
      isActive: true,
      ...(audience ? { audience } : {}),
    },
    orderBy: [{ audience: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, isActive: true },
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  take = 4,
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: productId },
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true } },
    },
    take,
  });
}
