const formatter = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

/** Formats a PKR amount as "Rs 12,500". */
export function formatPrice(amount: number): string {
  return `Rs ${formatter.format(Math.round(amount))}`;
}

type Priced = { price: number; salePrice?: number | null };

/** True when there is a valid sale price below the normal price. */
export function isOnSale({ price, salePrice }: Priced): boolean {
  return typeof salePrice === "number" && salePrice > 0 && salePrice < price;
}

/** The price the customer actually pays: the sale price if on sale, else the normal price. */
export function getEffectivePrice(product: Priced): number {
  return isOnSale(product) ? (product.salePrice as number) : product.price;
}

/** Whole-number % off (e.g. 20 for 20% off), or 0 when not on sale. */
export function getDiscountPercent(product: Priced): number {
  if (!isOnSale(product) || product.price <= 0) return 0;
  return Math.round(
    ((product.price - (product.salePrice as number)) / product.price) * 100,
  );
}
