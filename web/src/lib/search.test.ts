import { describe, expect, it } from "vitest";
import {
  matchesTokens,
  normaliseText,
  searchHaystack,
  searchTokens,
} from "./search";

describe("normaliseText", () => {
  it("lower-cases, trims and collapses whitespace", () => {
    expect(normaliseText("  Butterfly \t  TENERGY\n05 ")).toBe(
      "butterfly tenergy 05",
    );
  });

  it("strips accents", () => {
    expect(normaliseText("Tibhar Évolution MX-P")).toBe("tibhar evolution mx-p");
  });
});

describe("searchTokens", () => {
  it("splits a query into normalised words", () => {
    expect(searchTokens("  Butterfly  Tenergy ")).toEqual([
      "butterfly",
      "tenergy",
    ]);
  });

  it("returns no tokens for an empty or blank query", () => {
    expect(searchTokens("")).toEqual([]);
    expect(searchTokens("   ")).toEqual([]);
  });
});

describe("searchHaystack", () => {
  it("combines name and brand", () => {
    expect(searchHaystack("Viscaria", "Butterfly")).toBe("viscaria butterfly");
  });

  it("works without a brand", () => {
    expect(searchHaystack("Viscaria", null)).toBe("viscaria");
  });
});

describe("matchesTokens", () => {
  const haystack = searchHaystack("Tenergy 05 Rubber", "Butterfly");

  it("matches when every token appears, in any order", () => {
    expect(matchesTokens(haystack, searchTokens("butterfly tenergy"))).toBe(true);
    expect(matchesTokens(haystack, searchTokens("05 TENERGY"))).toBe(true);
  });

  it("matches partial words", () => {
    expect(matchesTokens(haystack, searchTokens("tener butt"))).toBe(true);
  });

  it("fails when any token is missing", () => {
    expect(matchesTokens(haystack, searchTokens("tenergy dhs"))).toBe(false);
  });

  it("matches everything when there are no tokens", () => {
    expect(matchesTokens(haystack, [])).toBe(true);
  });
});
