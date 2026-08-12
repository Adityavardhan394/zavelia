import { describe, expect, it } from "vitest";
import {
  calculateDiscountPercent,
  calculateOrderTotals,
  calculateShippingInPaise,
  formatINRFromPaise,
  freeShippingProgress,
} from "@/lib/utils/money";
import { availableStock } from "@/lib/utils/stock";
import {
  generateOrderNumber,
  reservationExpiresAt,
} from "@/lib/utils/order-number";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp/message";
import { createOrderSchema, indianPhoneSchema } from "@/lib/validations";

describe("money", () => {
  it("formats INR from paise", () => {
    expect(formatINRFromPaise(30000)).toContain("300");
    expect(formatINRFromPaise(4900)).toContain("49");
  });

  it("calculates free shipping at exactly 30000 paise", () => {
    expect(calculateShippingInPaise(29900)).toBe(4900);
    expect(calculateShippingInPaise(30000)).toBe(0);
    expect(calculateShippingInPaise(50000)).toBe(0);
  });

  it("builds free shipping progress messages", () => {
    expect(freeShippingProgress(22500).message).toContain("75");
    expect(freeShippingProgress(30000).message).toBe(
      "You unlocked FREE shipping.",
    );
  });

  it("calculates discount percent", () => {
    expect(calculateDiscountPercent(50000, 100000)).toBe(50);
    expect(calculateDiscountPercent(50000, 40000)).toBeNull();
  });

  it("calculates order totals", () => {
    const totals = calculateOrderTotals({
      subtotalInPaise: 25000,
      discountInPaise: 0,
    });
    expect(totals.shippingInPaise).toBe(4900);
    expect(totals.totalInPaise).toBe(29900);
  });
});

describe("stock", () => {
  it("computes available stock", () => {
    expect(availableStock(10, 3)).toBe(7);
    expect(availableStock(2, 5)).toBe(0);
  });
});

describe("order number and expiry", () => {
  it("generates ZAV order numbers", () => {
    const date = new Date(Date.UTC(2026, 7, 12));
    expect(generateOrderNumber(date, 1)).toBe("ZAV-20260812-0001");
  });

  it("calculates reservation expiry", () => {
    const from = new Date("2026-08-12T10:00:00.000Z");
    const expires = reservationExpiresAt(from, 30);
    expect(expires.toISOString()).toBe("2026-08-12T10:30:00.000Z");
  });
});

describe("whatsapp", () => {
  it("formats and encodes message", () => {
    const message = buildWhatsAppMessage({
      orderNumber: "ZAV-20260812-0001",
      customerName: "Asha",
      phone: "9876543210",
      addressLines: ["12 MG Road", "Bengaluru, KA 560001", "India"],
      items: [
        {
          productName: "Hoops",
          sku: "SKU-1",
          variantName: "Size: M",
          quantity: 1,
          unitPriceInPaise: 49900,
          lineTotalInPaise: 49900,
        },
      ],
      subtotalInPaise: 49900,
      discountInPaise: 0,
      shippingInPaise: 0,
      totalInPaise: 49900,
      customerNotes: "Please gift wrap",
      orderUrl: "http://localhost:3000/order/ZAV-20260812-0001?token=abc",
    });
    expect(message).toContain("ZAVÉLIA");
    expect(message).toContain("ZAV-20260812-0001");
    expect(message).toContain("SKU-1");
    const url = buildWhatsAppUrl("919876543210", message);
    expect(url.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("ZAVÉLIA"));
  });
});

describe("validation", () => {
  it("validates indian phone", () => {
    expect(indianPhoneSchema.safeParse("9876543210").success).toBe(true);
    expect(indianPhoneSchema.safeParse("0876543210").success).toBe(false);
  });

  it("validates create order payload shape", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: "p1", variantId: "v1", quantity: 1 }],
      address: {
        fullName: "Asha Rao",
        phone: "9876543210",
        email: "",
        addressLine1: "12 MG Road",
        addressLine2: "",
        landmark: "",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        country: "India",
        customerNotes: "",
        acceptTerms: true,
      },
      idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });
});
