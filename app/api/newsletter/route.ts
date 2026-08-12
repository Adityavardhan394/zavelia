import { z } from "zod";
import { ok, fail } from "@/lib/utils/api";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit({
    key: `newsletter:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.success) {
    return fail("Too many requests", { status: 429, code: "RATE_LIMITED" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON", { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail("Enter a valid email", { status: 400, code: "VALIDATION_ERROR" });
  }

  // Soft success — wire to email provider later
  return ok({ subscribed: true, email: parsed.data.email });
}
