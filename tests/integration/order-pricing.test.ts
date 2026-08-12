import { describe, expect, it } from "vitest";
import {
  calculateShippingInPaise,
  calculateOrderTotals,
} from "@/lib/utils/money";
import { availableStock } from "@/lib/utils/stock";
import { releaseOrderStock } from "@/lib/inventory/reservations";

describe("inventory invariants", () => {
  it("never reports negative available stock", () => {
    expect(availableStock(0, 0)).toBe(0);
    expect(availableStock(3, 10)).toBe(0);
  });
});

describe("pricing authority helpers", () => {
  it("ignores client-side temptation by recalculating shipping from subtotal", () => {
    // Client might claim free shipping at 10000 paise — server must still charge 4900
    expect(calculateShippingInPaise(10000)).toBe(4900);
    const totals = calculateOrderTotals({ subtotalInPaise: 10000 });
    expect(totals.totalInPaise).toBe(14900);
  });
});

describe("releaseOrderStock idempotency contract", () => {
  it("exports release helper", () => {
    expect(typeof releaseOrderStock).toBe("function");
  });
});
