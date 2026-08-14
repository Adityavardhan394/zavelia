import { NextRequest } from "next/server";
import { signIn } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validations";
import { fail, ok } from "@/lib/utils/api";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { maskEmail } from "@/lib/security/sanitize";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid credentials payload", {
      status: 400,
      code: "VALIDATION_ERROR",
    });
  }

  const ip = getClientIp(request.headers);
  const limited = rateLimit({
    key: `login:${ip}:${parsed.data.email.toLowerCase()}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.success) {
    return fail("Too many login attempts", {
      status: 429,
      code: "RATE_LIMITED",
    });
  }

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    // Auth.js returns an error URL for failed credential sign-ins when
    // redirects are disabled; it does not throw in that case.
    if (
      typeof result === "string" &&
      new URL(result, request.url).searchParams.has("error")
    ) {
      return fail("Invalid email or password", {
        status: 401,
        code: "UNAUTHORIZED",
      });
    }

    console.info("Admin login success", {
      email: maskEmail(parsed.data.email),
    });
    return ok({ ok: true });
  } catch {
    return fail("Invalid email or password", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }
}
