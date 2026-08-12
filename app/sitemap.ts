import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/shipping-policy",
    "/returns-policy",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${site}${path}`,
    lastModified: new Date(),
  }));

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticRoutes,
      ...products.map((p) => ({
        url: `${site}/product/${p.slug}`,
        lastModified: p.updatedAt,
      })),
      ...categories.map((c) => ({
        url: `${site}/category/${c.slug}`,
        lastModified: c.updatedAt,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
