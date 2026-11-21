import type { EnquiryItem, SanityImage, SelectedOption } from "./types";

/*
 * Enquiry list ("WhatsApp cart") store, persisted to localStorage.
 *
 * A tiny external store for React's useSyncExternalStore (see hooks/useEnquiryList.ts):
 * - The server snapshot is always an empty, not-ready list, so server HTML and the first
 *   client render match (no hydration mismatch); React then re-renders with the saved list.
 * - localStorage is read lazily on first use and every read/write is wrapped in try/catch
 *   (private mode, blocked storage, quota errors). Bad data is dropped, never thrown.
 * - Other tabs stay in sync through the `storage` event.
 */

const STORAGE_KEY = "tt68-enquiry";
/** Bump when the stored shape changes, and migrate (or drop) older versions in `parseStored`. */
const STORAGE_VERSION = 1;

/** Highest quantity per line (matches the product page stepper). */
export const MAX_ITEM_QTY = 20;

export type EnquirySnapshot = {
  /** False until the saved list has been read (always false on the server). */
  ready: boolean;
  items: EnquiryItem[];
};

const SERVER_SNAPSHOT: EnquirySnapshot = { ready: false, items: [] };

let snapshot: EnquirySnapshot | null = null;
const listeners = new Set<() => void>();

// --- Keys --------------------------------------------------------------------

/** One line per product + chosen options, e.g. "abc123|Handle=FL;Thickness=2.0". */
export function enquiryItemKey(
  productId: string,
  options: SelectedOption[],
): string {
  const opts = [...options]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((o) => `${o.name}=${o.value}`)
    .join(";");
  return `${productId}|${opts}`;
}

const keyOf = (item: EnquiryItem) =>
  enquiryItemKey(item.productId, item.options);

// --- Safe parsing ------------------------------------------------------------

type Rec = Record<string, unknown>;

const isRecord = (v: unknown): v is Rec =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const clampQty = (qty: number) =>
  Math.min(MAX_ITEM_QTY, Math.max(1, Math.round(qty)));

function numbers<K extends string>(v: unknown, keys: K[]) {
  if (!isRecord(v) || !keys.every((k) => isNum(v[k]))) return null;
  return Object.fromEntries(keys.map((k) => [k, v[k]])) as Record<K, number>;
}

/** Keeps only the fields the image URL builder needs; drops the (large) LQIP string. */
export function compactImage(image: unknown): SanityImage | null {
  if (!isRecord(image) || !isRecord(image.asset)) return null;
  const { asset } = image;
  if (typeof asset._id !== "string" || !asset._id) return null;
  const dims = isRecord(asset.metadata)
    ? numbers(asset.metadata.dimensions, ["width", "height", "aspectRatio"])
    : null;
  return {
    alt: typeof image.alt === "string" ? image.alt : null,
    crop: numbers(image.crop, ["top", "bottom", "left", "right"]),
    hotspot: numbers(image.hotspot, ["x", "y", "width", "height"]),
    asset: { _id: asset._id, metadata: { lqip: null, dimensions: dims } },
  };
}

function parseItem(v: unknown): EnquiryItem | null {
  if (!isRecord(v)) return null;
  const { productId, slug, name, unitPrice, quantity, options } = v;
  if (
    typeof productId !== "string" ||
    !productId ||
    typeof slug !== "string" ||
    typeof name !== "string" ||
    !isNum(unitPrice) ||
    unitPrice < 0 ||
    !isNum(quantity) ||
    !Array.isArray(options)
  ) {
    return null;
  }
  const opts = options.filter(
    (o): o is SelectedOption =>
      isRecord(o) && typeof o.name === "string" && typeof o.value === "string",
  );
  if (opts.length !== options.length) return null;
  return {
    productId,
    slug,
    name,
    image: compactImage(v.image),
    unitPrice,
    options: opts.map(({ name, value }) => ({ name, value })),
    quantity: clampQty(quantity),
  };
}

/** Combines lines with the same key (keeps the first, adds quantities). */
function mergeDuplicates(items: EnquiryItem[]): EnquiryItem[] {
  const byKey = new Map<string, EnquiryItem>();
  for (const item of items) {
    const key = keyOf(item);
    const existing = byKey.get(key);
    byKey.set(
      key,
      existing
        ? {
            ...existing,
            quantity: clampQty(existing.quantity + item.quantity),
          }
        : item,
    );
  }
  return [...byKey.values()];
}

function parseStored(raw: string | null): EnquiryItem[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    // Unknown or older versions are dropped (no migrations needed yet).
    if (
      !isRecord(data) ||
      data.v !== STORAGE_VERSION ||
      !Array.isArray(data.items)
    ) {
      return [];
    }
    return mergeDuplicates(
      data.items
        .map(parseItem)
        .filter((i): i is EnquiryItem => i !== null),
    );
  } catch {
    return [];
  }
}

// --- Storage -----------------------------------------------------------------

function readStorage(): EnquiryItem[] {
  try {
    return parseStored(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeStorage(items: EnquiryItem[]): void {
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: STORAGE_VERSION, items }),
      );
    }
  } catch {
    // Storage full or blocked: the list still works for this visit.
  }
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function setItems(items: EnquiryItem[]): void {
  snapshot = { ready: true, items };
  writeStorage(items);
  emit();
}

function currentItems(): EnquiryItem[] {
  return getEnquirySnapshot().items;
}

function onStorage(event: StorageEvent): void {
  // key === null means another tab called localStorage.clear().
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  snapshot = { ready: true, items: parseStored(event.newValue) };
  emit();
}

// --- useSyncExternalStore API --------------------------------------------------

export function subscribeEnquiry(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getEnquirySnapshot(): EnquirySnapshot {
  snapshot ??= { ready: true, items: readStorage() };
  return snapshot;
}

export function getEnquiryServerSnapshot(): EnquirySnapshot {
  return SERVER_SNAPSHOT;
}

// --- Actions -----------------------------------------------------------------

export type AddResult = {
  /** Quantity of that line after adding. */
  quantity: number;
  /** True when the quantity was limited to MAX_ITEM_QTY. */
  capped: boolean;
};

/** Adds a line, or increases the quantity if the same product + options is already listed. */
export function addEnquiryItem(input: EnquiryItem): AddResult {
  const item: EnquiryItem = {
    ...input,
    image: compactImage(input.image),
    quantity: clampQty(input.quantity),
  };
  const key = keyOf(item);
  const items = currentItems();
  const existing = items.find((i) => keyOf(i) === key);
  const wanted = (existing?.quantity ?? 0) + item.quantity;
  const quantity = Math.min(MAX_ITEM_QTY, wanted);

  setItems(
    existing
      ? items.map((i) =>
          keyOf(i) === key
            ? // Refresh name, price and photo in case the product changed since.
              { ...item, quantity }
            : i,
        )
      : [...items, { ...item, quantity }],
  );
  return { quantity, capped: wanted > MAX_ITEM_QTY };
}

export function updateEnquiryQuantity(key: string, quantity: number): void {
  setItems(
    currentItems().map((i) =>
      keyOf(i) === key ? { ...i, quantity: clampQty(quantity) } : i,
    ),
  );
}

export function removeEnquiryItem(key: string): void {
  setItems(currentItems().filter((i) => keyOf(i) !== key));
}

export function clearEnquiryList(): void {
  setItems([]);
}

// --- Derived values ----------------------------------------------------------

export function enquiryTotal(items: EnquiryItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

/** Total number of pieces (sum of quantities), shown on the header badge. */
export function enquiryCount(items: EnquiryItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
