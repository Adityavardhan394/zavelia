import { prisma } from "@/lib/db/prisma";
import { releaseExpiredReservations } from "@/lib/inventory/reservations";
import { safeEqual } from "@/lib/security/sanitize";
import { fail, ok } from "@/lib/utils/api";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return fail("Cron is not configured", {
      status: 500,
      code: "CONFIG_ERROR",
    });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token || !safeEqual(token, secret)) {
    return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      return releaseExpiredReservations(tx);
    });
    return ok(result);
  } catch (error) {
    console.error("[POST /api/cron/release-expired-reservations]", error);
    return fail("Failed to release expired reservations", {
      status: 500,
      code: "INTERNAL_ERROR",
    });
  }
}
