import { listCategories } from "@/lib/products/queries";
import { fail, ok } from "@/lib/utils/api";
import type { Audience } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const audience = new URL(request.url).searchParams.get("audience") as
      | Audience
      | null;
    const categories = await listCategories(audience || undefined);
    return ok(categories);
  } catch {
    return fail("Unable to list categories", {
      status: 500,
      code: "SERVER_ERROR",
    });
  }
}
