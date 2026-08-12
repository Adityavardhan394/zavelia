import { listProducts } from "@/lib/products/queries";
import { fail, ok } from "@/lib/utils/api";
import type { Audience } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await listProducts({
      q: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      audience: (searchParams.get("audience") as Audience) || undefined,
      material: searchParams.get("material") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      inStock: searchParams.get("inStock") === "true",
      featured: searchParams.get("featured") === "true",
      newArrival: searchParams.get("newArrival") === "true",
      bestSeller: searchParams.get("bestSeller") === "true",
      sort: (searchParams.get("sort") as
        | "featured"
        | "newest"
        | "price-asc"
        | "price-desc"
        | "best-selling") || "featured",
      page: Number(searchParams.get("page") || "1"),
      pageSize: Number(searchParams.get("pageSize") || "12"),
    });
    return ok(result);
  } catch {
    return fail("Unable to list products", { status: 500, code: "SERVER_ERROR" });
  }
}
