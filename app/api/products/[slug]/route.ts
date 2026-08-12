import { getProductBySlug } from "@/lib/products/queries";
import { fail, ok } from "@/lib/utils/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return fail("Product not found", { status: 404, code: "NOT_FOUND" });
  }
  return ok(product);
}
