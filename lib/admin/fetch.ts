export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class AdminApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status: number, code = "BAD_REQUEST", details?: unknown) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    cache: "no-store",
  });

  let json: ApiSuccess<T> | ApiErrorBody | null = null;
  try {
    json = (await res.json()) as ApiSuccess<T> | ApiErrorBody;
  } catch {
    throw new AdminApiError("Unexpected server response", res.status);
  }

  if (!res.ok || !json || json.success === false) {
    const err = json && "error" in json ? json.error : null;
    throw new AdminApiError(
      err?.message ?? "Request failed",
      res.status,
      err?.code ?? "REQUEST_FAILED",
      err?.details,
    );
  }

  return json.data;
}
