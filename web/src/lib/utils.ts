import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export {
  formatPrice,
  getDiscountPercent,
  getEffectivePrice,
  isOnSale,
} from "./price";

/** Merge Tailwind classes; later classes win over conflicting earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Public site origin, without a trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://tabletennis68.com"
).replace(/\/+$/, "");

/** Turns a site path ("/shop/") into a full URL ("https://tabletennis68.com/shop/"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Site path of a product page. Trailing slash matches `trailingSlash: true` in next.config. */
export function productPath(slug: string): string {
  return `/product/${slug}/`;
}
