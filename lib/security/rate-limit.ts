type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): { success: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(options.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      remaining: options.limit - 1,
      retryAfterMs: 0,
    };
  }

  if (existing.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
    };
  }

  existing.count += 1;
  buckets.set(options.key, existing);
  return {
    success: true,
    remaining: options.limit - existing.count,
    retryAfterMs: 0,
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") || "unknown";
}
