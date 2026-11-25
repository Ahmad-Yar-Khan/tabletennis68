import { describe, expect, it } from "vitest";
import {
  formatPrice,
  getDiscountPercent,
  getEffectivePrice,
  isOnSale,
} from "./price";

describe("formatPrice", () => {
  it("formats PKR as 'Rs 12,500'", () => {
    expect(formatPrice(12500)).toBe("Rs 12,500");
  });

  it("uses thousands grouping for large amounts", () => {
    expect(formatPrice(1250000)).toBe("Rs 1,250,000");
  });

  it("shows no decimals and rounds to the nearest rupee", () => {
    expect(formatPrice(999.4)).toBe("Rs 999");
    expect(formatPrice(999.6)).toBe("Rs 1,000");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("Rs 0");
  });
});

describe("isOnSale", () => {
  it("is true when the sale price is below the price", () => {
    expect(isOnSale({ price: 10000, salePrice: 8000 })).toBe(true);
  });

  it.each([
    ["no sale price", undefined],
    ["null sale price", null],
    ["zero sale price", 0],
    ["negative sale price", -100],
    ["sale price equal to price", 10000],
    ["sale price above price", 12000],
  ])("is false for %s", (_label, salePrice) => {
    expect(isOnSale({ price: 10000, salePrice })).toBe(false);
  });
});

describe("getEffectivePrice", () => {
  it("returns the sale price when on sale", () => {
    expect(getEffectivePrice({ price: 10000, salePrice: 7500 })).toBe(7500);
  });

  it("returns the normal price when the sale price is invalid", () => {
    expect(getEffectivePrice({ price: 10000, salePrice: 15000 })).toBe(10000);
    expect(getEffectivePrice({ price: 10000, salePrice: null })).toBe(10000);
  });
});

describe("getDiscountPercent", () => {
  it("returns the whole-number percentage off", () => {
    expect(getDiscountPercent({ price: 10000, salePrice: 8000 })).toBe(20);
  });

  it("rounds to the nearest whole percent", () => {
    // 1/3 off = 33.33…%
    expect(getDiscountPercent({ price: 3000, salePrice: 2000 })).toBe(33);
    // 2/3 off = 66.67%
    expect(getDiscountPercent({ price: 3000, salePrice: 1000 })).toBe(67);
  });

  it("returns 0 when not on sale", () => {
    expect(getDiscountPercent({ price: 10000, salePrice: null })).toBe(0);
    expect(getDiscountPercent({ price: 10000, salePrice: 10000 })).toBe(0);
  });
});
