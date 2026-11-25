import { describe, expect, it } from "vitest";
import { displayPhone, telHref } from "./contact";

describe("displayPhone", () => {
  it.each([
    ["923001234567", "+92 300 1234567"],
    ["+92 300 1234567", "+92 300 1234567"],
    ["+92-300-1234567", "+92 300 1234567"],
  ])("formats %s as %s", (input, expected) => {
    expect(displayPhone(input)).toBe(expected);
  });

  it("returns other numbers exactly as entered", () => {
    expect(displayPhone("0300 1234567")).toBe("0300 1234567");
    expect(displayPhone("042 35123456")).toBe("042 35123456");
  });
});

describe("telHref", () => {
  it("keeps digits and the leading +", () => {
    expect(telHref("+92 300-123 4567")).toBe("tel:+923001234567");
    expect(telHref("0300 1234567")).toBe("tel:03001234567");
  });
});
