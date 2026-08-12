import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, {
    status: 200,
    ...init,
  });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, {
    status: 201,
  });
}

export function fail(
  message: string,
  options?: {
    status?: number;
    code?: string;
    details?: unknown;
  },
) {
  const status = options?.status ?? 400;
  return NextResponse.json(
    {
      success: false,
      error: {
        code: options?.code ?? "BAD_REQUEST",
        message,
        details: options?.details,
      },
    } satisfies ApiError,
    { status },
  );
}
