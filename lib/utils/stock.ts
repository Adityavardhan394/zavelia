export function availableStock(
  stockOnHand: number,
  stockReserved: number,
): number {
  return Math.max(0, stockOnHand - stockReserved);
}

export function isLowStock(
  stockOnHand: number,
  stockReserved: number,
  lowStockThreshold: number,
): boolean {
  const available = availableStock(stockOnHand, stockReserved);
  return available > 0 && available <= lowStockThreshold;
}

export function isOutOfStock(
  stockOnHand: number,
  stockReserved: number,
): boolean {
  return availableStock(stockOnHand, stockReserved) <= 0;
}
