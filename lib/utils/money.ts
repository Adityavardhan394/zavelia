export const FREE_SHIPPING_THRESHOLD_PAISE = 30_000;
export const STANDARD_SHIPPING_PAISE = 4_900;
export const RESERVATION_TTL_MINUTES = 30;

export function formatINRFromPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(rupees);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function calculateDiscountPercent(
  priceInPaise: number,
  compareAtPriceInPaise: number | null | undefined,
): number | null {
  if (!compareAtPriceInPaise || compareAtPriceInPaise <= priceInPaise) {
    return null;
  }
  return Math.round(
    ((compareAtPriceInPaise - priceInPaise) / compareAtPriceInPaise) * 100,
  );
}

export function calculateShippingInPaise(
  subtotalAfterDiscountInPaise: number,
  freeShippingThresholdInPaise = FREE_SHIPPING_THRESHOLD_PAISE,
  standardShippingInPaise = STANDARD_SHIPPING_PAISE,
): number {
  if (subtotalAfterDiscountInPaise >= freeShippingThresholdInPaise) {
    return 0;
  }
  return standardShippingInPaise;
}

export function freeShippingProgress(
  subtotalAfterDiscountInPaise: number,
  freeShippingThresholdInPaise = FREE_SHIPPING_THRESHOLD_PAISE,
): { unlocked: boolean; remainingInPaise: number; message: string } {
  const remaining = Math.max(
    0,
    freeShippingThresholdInPaise - subtotalAfterDiscountInPaise,
  );
  if (remaining === 0) {
    return {
      unlocked: true,
      remainingInPaise: 0,
      message: "You unlocked FREE shipping.",
    };
  }
  return {
    unlocked: false,
    remainingInPaise: remaining,
    message: `Add ${formatINRFromPaise(remaining)} more to unlock free shipping.`,
  };
}

export function calculateLineTotal(
  unitPriceInPaise: number,
  quantity: number,
): number {
  return unitPriceInPaise * quantity;
}

export function calculateOrderTotals(input: {
  subtotalInPaise: number;
  discountInPaise?: number;
  freeShippingThresholdInPaise?: number;
  standardShippingInPaise?: number;
}) {
  const discountInPaise = Math.max(0, input.discountInPaise ?? 0);
  const afterDiscount = Math.max(0, input.subtotalInPaise - discountInPaise);
  const shippingInPaise = calculateShippingInPaise(
    afterDiscount,
    input.freeShippingThresholdInPaise,
    input.standardShippingInPaise,
  );
  return {
    subtotalInPaise: input.subtotalInPaise,
    discountInPaise,
    shippingInPaise,
    totalInPaise: afterDiscount + shippingInPaise,
  };
}
