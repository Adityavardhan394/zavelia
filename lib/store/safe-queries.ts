import {
  listProducts,
  listCategories,
  type ProductListParams,
} from "@/lib/products/queries";

export type AudienceValue =
  | "WOMEN"
  | "MEN"
  | "GIRLS"
  | "BOYS"
  | "UNISEX";

export type SafeProductList = Awaited<ReturnType<typeof listProducts>>;
export type SafeCategory = Awaited<ReturnType<typeof listCategories>>[number];

export async function safeListProducts(
  params: ProductListParams = {},
): Promise<SafeProductList> {
  try {
    return await listProducts(params);
  } catch (error) {
    console.error("listProducts failed", error);
    return {
      items: [],
      page: 1,
      pageSize: params.pageSize ?? 12,
      total: 0,
      totalPages: 1,
    };
  }
}

export async function safeListCategories(
  audience?: AudienceValue,
): Promise<SafeCategory[]> {
  try {
    return await listCategories(audience);
  } catch (error) {
    console.error("listCategories failed", error);
    return [];
  }
}

export function parseAudience(
  value: string | string[] | undefined,
): AudienceValue | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const allowed: AudienceValue[] = [
    "WOMEN",
    "MEN",
    "GIRLS",
    "BOYS",
    "UNISEX",
  ];
  return allowed.includes(raw as AudienceValue)
    ? (raw as AudienceValue)
    : undefined;
}

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
