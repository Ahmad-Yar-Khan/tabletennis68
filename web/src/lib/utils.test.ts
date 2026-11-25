import { describe, expect, it } from "vitest";
import { absoluteUrl, cn, productPath, SITE_URL } from "./utils";

describe("SITE_URL / absoluteUrl", () => {
  it("has no trailing slash", () => {
    expect(SITE_URL).toBe("https://tabletennis68.com");
  });

  it("joins paths with or without a leading slash", () => {
    expect(absoluteUrl("/shop/")).toBe("https://tabletennis68.com/shop/");
    expect(absoluteUrl("shop/")).toBe("https://tabletennis68.com/shop/");
    expect(absoluteUrl()).toBe("https://tabletennis68.com/");
  });
});

describe("productPath", () => {
  it("uses a trailing slash to match trailingSlash: true", () => {
    expect(productPath("viscaria")).toBe("/product/viscaria/");
  });
});

describe("cn", () => {
  it("lets later Tailwind classes win over conflicting earlier ones", () => {
    expect(cn("px-4 text-ink", "px-6")).toBe("text-ink px-6");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
