import { RESERVATION_TTL_MINUTES } from "@/lib/utils/money";

export function generateOrderNumber(date: Date, sequence: number): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `ZAV-${yyyy}${mm}${dd}-${seq}`;
}

export function reservationExpiresAt(
  from: Date = new Date(),
  ttlMinutes = RESERVATION_TTL_MINUTES,
): Date {
  return new Date(from.getTime() + ttlMinutes * 60 * 1000);
}
