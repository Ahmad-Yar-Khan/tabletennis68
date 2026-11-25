import { describe, expect, it } from "vitest";
import {
  buildFacets,
  clearedState,
  countActiveFilters,
  countMatches,
  EMPTY_STATE,
  filterProducts,
  filtersDiffer,
  hasActiveFilters,
  indexProducts,
  parseShopState,
  productCountLabel,
  serializeShopState,
  type ShopState,
} from "./shop";
import type { Brand, Category, ProductListItem } from "./types";

// --- Fixtures ----------------------------------------------------------------

function product(
  overrides: Partial<ProductListItem> & Pick<ProductListItem, "_id" | "name">,
): ProductListItem {
  return {
    _createdAt: "2026-01-01T00:00:00Z",
    slug: overrides._id,
    shortDescription: null,
    price: 10000,
    salePrice: null,
    inStock: true,
    featured: false,
    isNew: false,
    sortOrder: null,
    category: null,
    brand: null,
    image: null,
    hoverImage: null,
    ...overrides,
  };
}

const rubbers = { name: "Rubbers", slug: "rubbers" };
const blades = { name: "Blades", slug: "blades" };
const balls = { name: "Balls", slug: "balls" };
const butterfly = { name: "Butterfly", slug: "butterfly" };
const dhs = { name: "DHS", slug: "dhs" };
const nittaku = { name: "Nittaku", slug: "nittaku" };

/** Listed in the owner's order (the "recommended" sort). */
const PRODUCTS: ProductListItem[] = [
  product({
    _id: "tenergy",
    name: "Tenergy 05",
    category: rubbers,
    brand: butterfly,
    price: 16000,
    salePrice: 14000,
    _createdAt: "2026-03-01T00:00:00Z",
  }),
  product({
    _id: "viscaria",
    name: "Viscaria",
    category: blades,
    brand: butterfly,
    price: 30000,
    _createdAt: "2026-01-15T00:00:00Z",
  }),
  product({
    _id: "hurricane",
    name: "Hurricane 3",
    category: rubbers,
    brand: dhs,
    price: 6000,
    inStock: false,
    _createdAt: "2026-05-01T00:00:00Z",
  }),
  product({
    _id: "premium",
    name: "Premium 40+ balls",
    category: balls,
    brand: nittaku,
    price: 1500,
    _createdAt: "2026-02-01T00:00:00Z",
  }),
  product({
    _id: "no-brand",
    name: "Edge tape",
    category: null,
    brand: null,
    price: 500,
    _createdAt: "not a date",
  }),
];

const INDEX = indexProducts(PRODUCTS);

const state = (overrides: Partial<ShopState> = {}): ShopState => ({
  ...EMPTY_STATE,
  ...overrides,
});

const ids = (list: ProductListItem[]) => list.map((p) => p._id);

const params = (query: string) => new URLSearchParams(query);

// --- URL <-> state -----------------------------------------------------------

describe("parseShopState", () => {
  it("returns defaults for an empty query", () => {
    expect(parseShopState(params(""))).toEqual(EMPTY_STATE);
  });

  it("reads every field", () => {
    expect(
      parseShopState(
        params(
          "q=+tenergy+&category=rubbers,blades&brand=butterfly&min=5000&max=15000&stock=in&sort=price-asc&page=3",
        ),
      ),
    ).toEqual({
      q: "tenergy",
      categories: ["rubbers", "blades"],
      brands: ["butterfly"],
      min: 5000,
      max: 15000,
      inStockOnly: true,
      sort: "price-asc",
      page: 3,
    });
  });

  it("trims, de-duplicates and drops empty list entries", () => {
    expect(
      parseShopState(params("category= rubbers ,,rubbers,blades,")).categories,
    ).toEqual(["rubbers", "blades"]);
  });

  it("strips formatting from prices and ignores zero or junk", () => {
    expect(parseShopState(params("min=5,000&max=Rs15000"))).toMatchObject({
      min: 5000,
      max: 15000,
    });
    expect(parseShopState(params("min=0&max=abc"))).toMatchObject({
      min: null,
      max: null,
    });
  });

  it("falls back to the default sort for unknown values", () => {
    expect(parseShopState(params("sort=cheapest")).sort).toBe("recommended");
  });

  it("only treats stock=in as in-stock only", () => {
    expect(parseShopState(params("stock=yes")).inStockOnly).toBe(false);
  });

  it.each([
    ["", 1],
    ["abc", 1],
    ["0", 1],
    ["-2", 1],
    ["2.5", 1],
    ["4", 4],
    ["500", 100],
  ])("parses page=%s as %i", (value, expected) => {
    expect(parseShopState(params(`page=${value}`)).page).toBe(expected);
  });

  it("ignores the URL category on a locked category page", () => {
    const parsed = parseShopState(params("category=blades&brand=dhs"), {
      type: "category",
      slug: "rubbers",
    });
    expect(parsed.categories).toEqual([]);
    expect(parsed.brands).toEqual(["dhs"]);
  });

  it("ignores the URL brand on a locked brand page", () => {
    const parsed = parseShopState(params("category=blades&brand=dhs"), {
      type: "brand",
      slug: "butterfly",
    });
    expect(parsed.brands).toEqual([]);
    expect(parsed.categories).toEqual(["blades"]);
  });
});

describe("serializeShopState", () => {
  it("gives a clean URL for the default state", () => {
    expect(serializeShopState(EMPTY_STATE)).toBe("");
  });

  it("leaves out defaults and keeps commas readable", () => {
    expect(
      serializeShopState(
        state({ categories: ["rubbers", "blades"], sort: "name" }),
      ),
    ).toBe("category=rubbers,blades&sort=name");
  });

  it("trims the search text and omits blank searches", () => {
    expect(serializeShopState(state({ q: "  " }))).toBe("");
    expect(serializeShopState(state({ q: " dhs " }))).toBe("q=dhs");
  });

  it("encodes special characters in the search", () => {
    expect(serializeShopState(state({ q: "40+ & more" }))).toBe(
      "q=40%2B+%26+more",
    );
  });

  it("round-trips through parseShopState", () => {
    const full = state({
      q: "tenergy 05",
      categories: ["rubbers"],
      brands: ["butterfly", "dhs"],
      min: 1000,
      max: 20000,
      inStockOnly: true,
      sort: "price-desc",
      page: 2,
    });
    expect(parseShopState(params(serializeShopState(full)))).toEqual(full);
  });
});

// --- Derived state -----------------------------------------------------------

describe("countActiveFilters / hasActiveFilters", () => {
  it("counts each category and brand, the price range once, and stock", () => {
    expect(
      countActiveFilters(
        state({
          categories: ["rubbers", "blades"],
          brands: ["dhs"],
          min: 1000,
          max: 5000,
          inStockOnly: true,
        }),
      ),
    ).toBe(5);
  });

  it("does not count search or sort as filters", () => {
    const s = state({ q: "dhs", sort: "name" });
    expect(countActiveFilters(s)).toBe(0);
    expect(hasActiveFilters(s)).toBe(true);
  });

  it("is inactive for the empty state", () => {
    expect(hasActiveFilters(EMPTY_STATE)).toBe(false);
  });
});

describe("clearedState", () => {
  it("clears filters, search and page but keeps the sort", () => {
    expect(
      clearedState(
        state({ q: "x", brands: ["dhs"], sort: "price-asc", page: 3 }),
      ),
    ).toEqual(state({ sort: "price-asc" }));
  });
});

describe("filtersDiffer", () => {
  it("ignores the page number", () => {
    expect(filtersDiffer(state({ page: 1 }), state({ page: 4 }))).toBe(false);
  });

  it("detects a change in filters, search or sort", () => {
    expect(filtersDiffer(state(), state({ brands: ["dhs"] }))).toBe(true);
    expect(filtersDiffer(state(), state({ q: "x" }))).toBe(true);
    expect(filtersDiffer(state(), state({ sort: "newest" }))).toBe(true);
  });
});

// --- Filtering and sorting ---------------------------------------------------

describe("filterProducts", () => {
  it("returns everything in the owner's order by default", () => {
    expect(ids(filterProducts(INDEX, EMPTY_STATE))).toEqual([
      "tenergy",
      "viscaria",
      "hurricane",
      "premium",
      "no-brand",
    ]);
  });

  it("does not mutate the input index", () => {
    const before = INDEX.map((i) => i.product._id);
    filterProducts(INDEX, state({ sort: "name" }));
    expect(INDEX.map((i) => i.product._id)).toEqual(before);
  });

  it("filters by one or more categories", () => {
    expect(ids(filterProducts(INDEX, state({ categories: ["rubbers"] })))).toEqual(
      ["tenergy", "hurricane"],
    );
    expect(
      ids(filterProducts(INDEX, state({ categories: ["blades", "balls"] }))),
    ).toEqual(["viscaria", "premium"]);
  });

  it("filters by brand and excludes products without one", () => {
    expect(ids(filterProducts(INDEX, state({ brands: ["butterfly"] })))).toEqual(
      ["tenergy", "viscaria"],
    );
  });

  it("combines category and brand with AND", () => {
    expect(
      ids(
        filterProducts(
          INDEX,
          state({ categories: ["rubbers"], brands: ["butterfly"] }),
        ),
      ),
    ).toEqual(["tenergy"]);
  });

  it("hides out-of-stock products when in-stock only is on", () => {
    expect(
      ids(filterProducts(INDEX, state({ inStockOnly: true }))),
    ).not.toContain("hurricane");
  });

  it("filters price ranges inclusively using the sale price", () => {
    // Tenergy is Rs 16,000 but on sale for Rs 14,000.
    expect(
      ids(filterProducts(INDEX, state({ min: 6000, max: 15000 }))),
    ).toEqual(["tenergy", "hurricane"]);
  });

  it("supports open-ended price ranges", () => {
    expect(ids(filterProducts(INDEX, state({ max: 1500 })))).toEqual([
      "premium",
      "no-brand",
    ]);
    expect(ids(filterProducts(INDEX, state({ min: 20000 })))).toEqual([
      "viscaria",
    ]);
  });

  it("swaps min and max when typed the wrong way round", () => {
    expect(
      ids(filterProducts(INDEX, state({ min: 15000, max: 6000 }))),
    ).toEqual(["tenergy", "hurricane"]);
  });

  it("searches name and brand, case- and order-insensitively", () => {
    expect(ids(filterProducts(INDEX, state({ q: "BUTTERFLY" })))).toEqual([
      "tenergy",
      "viscaria",
    ]);
    expect(ids(filterProducts(INDEX, state({ q: "05 butterfly" })))).toEqual([
      "tenergy",
    ]);
    expect(filterProducts(INDEX, state({ q: "stiga" }))).toEqual([]);
  });

  it("sorts by price low to high and high to low (using sale prices)", () => {
    expect(ids(filterProducts(INDEX, state({ sort: "price-asc" })))).toEqual([
      "no-brand",
      "premium",
      "hurricane",
      "tenergy",
      "viscaria",
    ]);
    expect(ids(filterProducts(INDEX, state({ sort: "price-desc" })))).toEqual([
      "viscaria",
      "tenergy",
      "hurricane",
      "premium",
      "no-brand",
    ]);
  });

  it("sorts newest first, with invalid dates last", () => {
    expect(ids(filterProducts(INDEX, state({ sort: "newest" })))).toEqual([
      "hurricane",
      "tenergy",
      "premium",
      "viscaria",
      "no-brand",
    ]);
  });

  it("sorts A–Z, ignoring case and comparing numbers naturally", () => {
    const index = indexProducts([
      product({ _id: "c", name: "ball 10" }),
      product({ _id: "a", name: "Ball 2" }),
      product({ _id: "b", name: "apron" }),
    ]);
    expect(ids(filterProducts(index, state({ sort: "name" })))).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("keeps the owner's order for equal prices", () => {
    const index = indexProducts([
      product({ _id: "first", name: "A", price: 1000 }),
      product({ _id: "second", name: "B", price: 1000 }),
    ]);
    expect(
      ids(filterProducts(index, state({ sort: "price-desc" }))),
    ).toEqual(["first", "second"]);
  });
});

describe("countMatches", () => {
  it("counts the filtered products", () => {
    expect(countMatches(INDEX, state({ brands: ["butterfly"] }))).toBe(2);
    expect(countMatches(INDEX, EMPTY_STATE)).toBe(PRODUCTS.length);
  });
});

// --- Facets ------------------------------------------------------------------

describe("buildFacets", () => {
  const category = (slug: string, name: string): Category => ({
    _id: slug,
    slug,
    name,
    description: null,
    image: null,
    productCount: 0,
  });
  const brand = (slug: string, name: string): Brand => ({
    _id: slug,
    slug,
    name,
    logo: null,
    productCount: 0,
  });

  it("lists only categories/brands with products, with counts, in query order", () => {
    const facets = buildFacets(
      PRODUCTS,
      [
        category("blades", "Blades"),
        category("shoes", "Shoes"),
        category("rubbers", "Rubbers"),
        category("balls", "Balls"),
      ],
      [
        brand("butterfly", "Butterfly"),
        brand("dhs", "DHS"),
        brand("stiga", "Stiga"),
      ],
    );

    expect(facets.categories).toEqual([
      { slug: "blades", name: "Blades", count: 1 },
      { slug: "rubbers", name: "Rubbers", count: 2 },
      { slug: "balls", name: "Balls", count: 1 },
    ]);
    expect(facets.brands).toEqual([
      { slug: "butterfly", name: "Butterfly", count: 2 },
      { slug: "dhs", name: "DHS", count: 1 },
    ]);
  });
});

describe("productCountLabel", () => {
  it("uses singular and plural correctly", () => {
    expect(productCountLabel(0)).toBe("0 products");
    expect(productCountLabel(1)).toBe("1 product");
    expect(productCountLabel(24)).toBe("24 products");
  });
});
