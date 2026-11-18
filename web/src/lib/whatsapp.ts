import { formatPrice } from "./price";
import type { EnquiryItem, SelectedOption } from "./types";
import { absoluteUrl, productPath } from "./utils";

/*
 * WhatsApp ordering. All wa.me links are built here.
 * *text* renders bold in WhatsApp; keep messages short with clear line breaks.
 */

/** `https://wa.me/<digits>?text=<message>`. Strips "+", spaces and dashes from the number. */
export function buildWhatsAppLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function optionLines(options: SelectedOption[] = []): string[] {
  return options.map((o) => `${o.name}: ${o.value}`);
}

type ProductMessageInput = {
  name: string;
  slug: string;
  /** Effective unit price (sale price if on sale). */
  unitPrice: number;
  options?: SelectedOption[];
  quantity?: number;
};

/** Order message for one product. */
export function productOrderMessage({
  name,
  slug,
  unitPrice,
  options,
  quantity = 1,
}: ProductMessageInput): string {
  const lines = [
    "Hi! I'd like to order:",
    "",
    `*${name}*`,
    ...optionLines(options),
    `Qty: ${quantity}`,
    `Price: ${formatPrice(unitPrice)}${quantity > 1 ? ` each (${formatPrice(unitPrice * quantity)})` : ""}`,
    "",
    absoluteUrl(productPath(slug)),
  ];
  return lines.join("\n");
}

/** Message for an out-of-stock product ("Ask about restock"). */
export function restockMessage({
  name,
  slug,
  options,
}: Pick<ProductMessageInput, "name" | "slug" | "options">): string {
  const lines = [
    "Hi! Is this coming back in stock?",
    "",
    `*${name}*`,
    ...optionLines(options),
    "",
    absoluteUrl(productPath(slug)),
  ];
  return lines.join("\n");
}

/** One message for the whole enquiry list, with an estimated total. */
export function enquiryListMessage(items: EnquiryItem[]): string {
  const itemBlocks = items.map((item, i) => {
    const opts = item.options.map((o) => `${o.name}: ${o.value}`).join(", ");
    return [
      `${i + 1}. *${item.name}*`,
      ...(opts ? [`   ${opts}`] : []),
      `   ${item.quantity} × ${formatPrice(item.unitPrice)} = ${formatPrice(item.unitPrice * item.quantity)}`,
    ].join("\n");
  });
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return [
    "Hi! I'd like to order these items:",
    "",
    itemBlocks.join("\n\n"),
    "",
    `Estimated total: *${formatPrice(total)}*`,
    "_Delivery charges to be confirmed._",
  ].join("\n");
}

/** Greeting for the floating WhatsApp button. */
export function greetingMessage(shopName = "tabletennis68"): string {
  return `Hi ${shopName}! I have a question about your table tennis gear.`;
}
