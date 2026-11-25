import { describe, expect, it } from "vitest";
import type { EnquiryItem } from "./types";
import {
  buildWhatsAppLink,
  enquiryListMessage,
  greetingMessage,
  productOrderMessage,
  restockMessage,
} from "./whatsapp";

const item = (overrides: Partial<EnquiryItem> = {}): EnquiryItem => ({
  productId: "p1",
  slug: "viscaria",
  name: "Butterfly Viscaria",
  image: null,
  unitPrice: 30000,
  options: [],
  quantity: 1,
  ...overrides,
});

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with no text when there is no message", () => {
    expect(buildWhatsAppLink("923001234567")).toBe(
      "https://wa.me/923001234567",
    );
  });

  it("strips +, spaces and dashes from the number", () => {
    expect(buildWhatsAppLink("+92 300-123 4567")).toBe(
      "https://wa.me/923001234567",
    );
  });

  it("URL-encodes the message, including new lines and symbols", () => {
    const link = buildWhatsAppLink("923001234567", "Hi!\n*Bold* & 50% off?");
    expect(link).toBe(
      "https://wa.me/923001234567?text=Hi!%0A*Bold*%20%26%2050%25%20off%3F",
    );
    const text = new URL(link).searchParams.get("text");
    expect(text).toBe("Hi!\n*Bold* & 50% off?");
  });
});

describe("productOrderMessage", () => {
  it("includes the name, quantity, price and absolute product URL", () => {
    expect(
      productOrderMessage({
        name: "Butterfly Viscaria",
        slug: "viscaria",
        unitPrice: 30000,
      }),
    ).toBe(
      [
        "Hi! I'd like to order:",
        "",
        "*Butterfly Viscaria*",
        "Qty: 1",
        "Price: Rs 30,000",
        "",
        "https://tabletennis68.com/product/viscaria/",
      ].join("\n"),
    );
  });

  it("lists each selected option on its own line", () => {
    const message = productOrderMessage({
      name: "Tenergy 05",
      slug: "tenergy-05",
      unitPrice: 14500,
      options: [
        { name: "Colour", value: "Red" },
        { name: "Thickness", value: "2.1" },
      ],
    });
    expect(message).toContain("*Tenergy 05*\nColour: Red\nThickness: 2.1\nQty: 1");
  });

  it("shows the unit price and line total when quantity > 1", () => {
    const message = productOrderMessage({
      name: "Nittaku 3-star",
      slug: "nittaku-3-star",
      unitPrice: 1200,
      quantity: 3,
    });
    expect(message).toContain("Qty: 3");
    expect(message).toContain("Price: Rs 1,200 each (Rs 3,600)");
  });
});

describe("restockMessage", () => {
  it("asks about restock and includes options and the product URL", () => {
    expect(
      restockMessage({
        name: "DHS Hurricane 3",
        slug: "hurricane-3",
        options: [{ name: "Thickness", value: "2.15" }],
      }),
    ).toBe(
      [
        "Hi! Is this coming back in stock?",
        "",
        "*DHS Hurricane 3*",
        "Thickness: 2.15",
        "",
        "https://tabletennis68.com/product/hurricane-3/",
      ].join("\n"),
    );
  });

  it("does not mention price or quantity", () => {
    const message = restockMessage({ name: "X", slug: "x" });
    expect(message).not.toMatch(/Qty|Price|Rs/);
  });
});

describe("enquiryListMessage", () => {
  it("lists every item with options, qty × price, an estimated total and a delivery note", () => {
    const message = enquiryListMessage([
      item({
        options: [
          { name: "Handle", value: "FL" },
          { name: "Colour", value: "Red" },
        ],
        quantity: 1,
      }),
      item({
        productId: "p2",
        name: "Nittaku Premium 40+",
        unitPrice: 1500,
        quantity: 2,
      }),
    ]);

    expect(message).toBe(
      [
        "Hi! I'd like to order these items:",
        "",
        "1. *Butterfly Viscaria*",
        "   Handle: FL, Colour: Red",
        "   1 × Rs 30,000 = Rs 30,000",
        "",
        "2. *Nittaku Premium 40+*",
        "   2 × Rs 1,500 = Rs 3,000",
        "",
        "Estimated total: *Rs 33,000*",
        "_Delivery charges to be confirmed._",
      ].join("\n"),
    );
  });

  it("omits the options line when an item has no options", () => {
    const message = enquiryListMessage([item()]);
    expect(message).toContain("1. *Butterfly Viscaria*\n   1 × Rs 30,000");
  });
});

describe("greetingMessage", () => {
  it("greets the shop by name", () => {
    expect(greetingMessage()).toBe(
      "Hi tabletennis68! I have a question about your table tennis gear.",
    );
    expect(greetingMessage("TT Shop")).toMatch(/^Hi TT Shop!/);
  });
});
