// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEnquirySnapshot, clearEnquiryList } from "@/lib/enquiry";
import { ProductPurchase, type PurchaseProduct } from "./ProductPurchase";

const notifyAdded = vi.fn();

vi.mock("@/components/enquiry/EnquiryProvider", () => ({
  useEnquiryUI: () => ({ notifyAdded }),
}));

const NUMBER = "923001234567";

const product = (overrides: Partial<PurchaseProduct> = {}): PurchaseProduct => ({
  _id: "p1",
  name: "Butterfly Viscaria",
  slug: "viscaria",
  price: 30000,
  salePrice: null,
  inStock: true,
  options: [],
  image: null,
  ...overrides,
});

const withOptions = product({
  options: [
    { _key: "h", name: "Handle", values: ["FL", "ST", "AN"] },
    { _key: "t", name: "Thickness", values: ["1.8", "2.0"] },
  ],
});

/** The decoded WhatsApp message from the order link. */
function waMessage(link: HTMLElement): string {
  const href = link.getAttribute("href") ?? "";
  expect(href.startsWith(`https://wa.me/${NUMBER}?text=`)).toBe(true);
  return new URL(href).searchParams.get("text") ?? "";
}

beforeEach(() => {
  // jsdom has neither of these.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  localStorage.clear();
  clearEnquiryList();
  notifyAdded.mockClear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProductPurchase: in stock, no options", () => {
  it("links straight to WhatsApp with the order message", () => {
    render(<ProductPurchase product={product()} whatsappNumber={NUMBER} />);

    const link = screen.getByRole("link", { name: /order on whatsapp/i });
    expect(waMessage(link)).toBe(
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

  it("uses the sale price in the message", () => {
    render(
      <ProductPurchase
        product={product({ salePrice: 25000 })}
        whatsappNumber={NUMBER}
      />,
    );
    const link = screen.getByRole("link", { name: /order on whatsapp/i });
    expect(waMessage(link)).toContain("Price: Rs 25,000");
  });

  it("updates the quantity, total and message", async () => {
    const user = userEvent.setup();
    render(<ProductPurchase product={product()} whatsappNumber={NUMBER} />);

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(screen.getByText("Total Rs 60,000")).toBeTruthy();
    const link = screen.getByRole("link", { name: /order on whatsapp/i });
    expect(waMessage(link)).toContain("Qty: 2\nPrice: Rs 30,000 each (Rs 60,000)");
  });

  it("does not let the quantity go below 1", () => {
    render(<ProductPurchase product={product()} whatsappNumber={NUMBER} />);
    const decrease = screen.getByRole("button", { name: "Decrease quantity" });
    expect((decrease as HTMLButtonElement).disabled).toBe(true);
  });

  it("adds the item to the enquiry list and shows a notice", async () => {
    const user = userEvent.setup();
    render(<ProductPurchase product={product()} whatsappNumber={NUMBER} />);

    await user.click(screen.getByRole("button", { name: /add to order list/i }));

    expect(getEnquirySnapshot().items).toEqual([
      {
        productId: "p1",
        slug: "viscaria",
        name: "Butterfly Viscaria",
        image: null,
        unitPrice: 30000,
        options: [],
        quantity: 1,
      },
    ]);
    expect(notifyAdded).toHaveBeenCalledWith({
      productName: "Butterfly Viscaria",
      note: undefined,
    });
  });
});

describe("ProductPurchase: with options", () => {
  it("disables ordering until every option is chosen, with a hint", () => {
    render(<ProductPurchase product={withOptions} whatsappNumber={NUMBER} />);

    expect(screen.queryByRole("link", { name: /order on whatsapp/i })).toBeNull();
    const order = screen.getByRole("button", { name: /order on whatsapp/i });
    const add = screen.getByRole("button", { name: /add to order list/i });
    expect((order as HTMLButtonElement).disabled).toBe(true);
    expect((add as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Select handle and thickness to order.")).toBeTruthy();
  });

  it("updates the hint as options are chosen", async () => {
    const user = userEvent.setup();
    render(<ProductPurchase product={withOptions} whatsappNumber={NUMBER} />);

    await user.click(screen.getByRole("radio", { name: "ST" }));

    expect(screen.getByText("Select thickness to order.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /order on whatsapp/i })).toBeNull();
  });

  it("enables WhatsApp with the chosen options once all are selected", async () => {
    const user = userEvent.setup();
    render(<ProductPurchase product={withOptions} whatsappNumber={NUMBER} />);

    await user.click(screen.getByRole("radio", { name: "FL" }));
    await user.click(screen.getByRole("radio", { name: "2.0" }));

    const link = screen.getByRole("link", { name: /order on whatsapp/i });
    expect(waMessage(link)).toContain(
      "*Butterfly Viscaria*\nHandle: FL\nThickness: 2.0\nQty: 1",
    );
    expect(screen.queryByText(/to order\.$/)).toBeNull();
  });

  it("saves the chosen options with the enquiry item", async () => {
    const user = userEvent.setup();
    render(<ProductPurchase product={withOptions} whatsappNumber={NUMBER} />);

    await user.click(screen.getByRole("radio", { name: "AN" }));
    await user.click(screen.getByRole("radio", { name: "1.8" }));
    await user.click(screen.getByRole("button", { name: /add to order list/i }));

    expect(getEnquirySnapshot().items[0].options).toEqual([
      { name: "Handle", value: "AN" },
      { name: "Thickness", value: "1.8" },
    ]);
  });

  it("tells the customer when the quantity was capped", async () => {
    const user = userEvent.setup();
    render(<ProductPurchase product={product()} whatsappNumber={NUMBER} />);
    const add = screen.getByRole("button", { name: /add to order list/i });

    for (let i = 0; i < 21; i++) await user.click(add);

    expect(getEnquirySnapshot().items[0].quantity).toBe(20);
    expect(notifyAdded).toHaveBeenLastCalledWith({
      productName: "Butterfly Viscaria",
      note: "Butterfly Viscaria: limited to 20 per item",
    });
  });
});

describe("ProductPurchase: out of stock", () => {
  it("shows 'Ask about restock' with the restock message, even before options are chosen", () => {
    render(
      <ProductPurchase
        product={{ ...withOptions, inStock: false }}
        whatsappNumber={NUMBER}
      />,
    );

    const link = screen.getByRole("link", { name: /ask about restock/i });
    expect(waMessage(link)).toMatch(/^Hi! Is this coming back in stock\?/);
    expect(screen.queryByRole("link", { name: /order on whatsapp/i })).toBeNull();
  });

  it("hides the quantity stepper and the add-to-list button", () => {
    render(
      <ProductPurchase
        product={product({ inStock: false })}
        whatsappNumber={NUMBER}
      />,
    );
    expect(screen.queryByRole("group", { name: /quantity/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /add to order list/i })).toBeNull();
  });
});

describe("ProductPurchase: no WhatsApp number set", () => {
  it("disables the order button and explains why", () => {
    render(<ProductPurchase product={product()} whatsappNumber={null} />);

    const order = screen.getByRole("button", { name: /order on whatsapp/i });
    expect((order as HTMLButtonElement).disabled).toBe(true);
    expect(
      screen.getByText(/WhatsApp ordering is not available right now/),
    ).toBeTruthy();
  });
});
