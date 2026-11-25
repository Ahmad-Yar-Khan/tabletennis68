// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EnquiryItem } from "./types";

const STORAGE_KEY = "tt68-enquiry";

type EnquiryModule = typeof import("./enquiry");

/** A fresh copy of the store module (its in-memory snapshot is module-level). */
async function load(): Promise<EnquiryModule> {
  vi.resetModules();
  return import("./enquiry");
}

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

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

const saveRaw = (value: unknown) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

beforeEach(() => {
  localStorage.clear();
});

describe("enquiryItemKey", () => {
  it("is the same regardless of option order", async () => {
    const { enquiryItemKey } = await load();
    const a = enquiryItemKey("p1", [
      { name: "Handle", value: "FL" },
      { name: "Colour", value: "Red" },
    ]);
    const b = enquiryItemKey("p1", [
      { name: "Colour", value: "Red" },
      { name: "Handle", value: "FL" },
    ]);
    expect(a).toBe(b);
    expect(a).toBe("p1|Colour=Red;Handle=FL");
  });

  it("differs for different option values", async () => {
    const { enquiryItemKey } = await load();
    expect(enquiryItemKey("p1", [{ name: "Handle", value: "FL" }])).not.toBe(
      enquiryItemKey("p1", [{ name: "Handle", value: "ST" }]),
    );
  });
});

describe("snapshots", () => {
  it("starts empty and ready on the client", async () => {
    const { getEnquirySnapshot } = await load();
    expect(getEnquirySnapshot()).toEqual({ ready: true, items: [] });
  });

  it("is always empty and not ready on the server (no hydration mismatch)", async () => {
    saveRaw({ v: 1, items: [item()] });
    const { getEnquiryServerSnapshot } = await load();
    expect(getEnquiryServerSnapshot()).toEqual({ ready: false, items: [] });
  });

  it("returns the same object until something changes (useSyncExternalStore requirement)", async () => {
    const { getEnquirySnapshot, addEnquiryItem } = await load();
    const first = getEnquirySnapshot();
    expect(getEnquirySnapshot()).toBe(first);
    addEnquiryItem(item());
    expect(getEnquirySnapshot()).not.toBe(first);
  });
});

describe("addEnquiryItem", () => {
  it("adds a line and saves it to localStorage", async () => {
    const { addEnquiryItem, getEnquirySnapshot } = await load();
    const result = addEnquiryItem(item({ quantity: 2 }));

    expect(result).toEqual({ quantity: 2, capped: false });
    expect(getEnquirySnapshot().items).toEqual([item({ quantity: 2 })]);
    expect(stored()).toEqual({ v: 1, items: [item({ quantity: 2 })] });
  });

  it("merges the same product + options (in any order) into one line", async () => {
    const { addEnquiryItem, getEnquirySnapshot } = await load();
    addEnquiryItem(
      item({
        options: [
          { name: "Handle", value: "FL" },
          { name: "Colour", value: "Red" },
        ],
      }),
    );
    const result = addEnquiryItem(
      item({
        quantity: 2,
        options: [
          { name: "Colour", value: "Red" },
          { name: "Handle", value: "FL" },
        ],
      }),
    );

    expect(result.quantity).toBe(3);
    expect(getEnquirySnapshot().items).toHaveLength(1);
  });

  it("keeps separate lines for different options", async () => {
    const { addEnquiryItem, getEnquirySnapshot } = await load();
    addEnquiryItem(item({ options: [{ name: "Handle", value: "FL" }] }));
    addEnquiryItem(item({ options: [{ name: "Handle", value: "ST" }] }));
    expect(getEnquirySnapshot().items).toHaveLength(2);
  });

  it("caps a line at MAX_ITEM_QTY and reports it", async () => {
    const { addEnquiryItem, MAX_ITEM_QTY } = await load();
    addEnquiryItem(item({ quantity: 15 }));
    expect(addEnquiryItem(item({ quantity: 10 }))).toEqual({
      quantity: MAX_ITEM_QTY,
      capped: true,
    });
  });

  it("clamps the added quantity to 1–20", async () => {
    const { addEnquiryItem, getEnquirySnapshot } = await load();
    addEnquiryItem(item({ productId: "a", quantity: 0 }));
    addEnquiryItem(item({ productId: "b", quantity: 99 }));
    expect(getEnquirySnapshot().items.map((i) => i.quantity)).toEqual([1, 20]);
  });

  it("refreshes the name and price when re-adding an existing line", async () => {
    const { addEnquiryItem, getEnquirySnapshot } = await load();
    addEnquiryItem(item({ unitPrice: 30000 }));
    addEnquiryItem(item({ unitPrice: 27000, name: "Viscaria (new)" }));
    expect(getEnquirySnapshot().items[0]).toMatchObject({
      unitPrice: 27000,
      name: "Viscaria (new)",
      quantity: 2,
    });
  });

  it("notifies subscribers", async () => {
    const { addEnquiryItem, subscribeEnquiry } = await load();
    const listener = vi.fn();
    const unsubscribe = subscribeEnquiry(listener);
    addEnquiryItem(item());
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    addEnquiryItem(item());
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("updateEnquiryQuantity / removeEnquiryItem / clearEnquiryList", () => {
  it("updates the quantity of one line, clamped to 1–20", async () => {
    const mod = await load();
    mod.addEnquiryItem(item());
    const key = mod.enquiryItemKey("p1", []);

    mod.updateEnquiryQuantity(key, 5);
    expect(mod.getEnquirySnapshot().items[0].quantity).toBe(5);
    mod.updateEnquiryQuantity(key, 0);
    expect(mod.getEnquirySnapshot().items[0].quantity).toBe(1);
    mod.updateEnquiryQuantity(key, 50);
    expect(mod.getEnquirySnapshot().items[0].quantity).toBe(20);
  });

  it("removes one line", async () => {
    const mod = await load();
    mod.addEnquiryItem(item({ productId: "a" }));
    mod.addEnquiryItem(item({ productId: "b" }));
    mod.removeEnquiryItem(mod.enquiryItemKey("a", []));
    expect(mod.getEnquirySnapshot().items.map((i) => i.productId)).toEqual([
      "b",
    ]);
  });

  it("removes the storage key when the list becomes empty", async () => {
    const mod = await load();
    mod.addEnquiryItem(item());
    mod.clearEnquiryList();
    expect(mod.getEnquirySnapshot().items).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("reading saved data", () => {
  it("restores a saved list", async () => {
    saveRaw({ v: 1, items: [item({ quantity: 3 })] });
    const { getEnquirySnapshot } = await load();
    expect(getEnquirySnapshot().items).toEqual([item({ quantity: 3 })]);
  });

  it.each([
    ["corrupt JSON", "{not json"],
    ["an unknown version", JSON.stringify({ v: 99, items: [item()] })],
    ["a missing items array", JSON.stringify({ v: 1 })],
    ["a bare array", JSON.stringify([item()])],
  ])("drops %s without throwing", async (_label, raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    const { getEnquirySnapshot } = await load();
    expect(getEnquirySnapshot().items).toEqual([]);
  });

  it("drops invalid lines but keeps valid ones", async () => {
    saveRaw({
      v: 1,
      items: [
        item({ productId: "good" }),
        { ...item(), productId: "" },
        { ...item(), unitPrice: -5 },
        { ...item(), unitPrice: "1000" },
        { ...item(), quantity: Number.NaN },
        { ...item(), options: [{ name: "Handle" }] },
        null,
      ],
    });
    const { getEnquirySnapshot } = await load();
    expect(getEnquirySnapshot().items.map((i) => i.productId)).toEqual([
      "good",
    ]);
  });

  it("merges duplicate saved lines and clamps quantities", async () => {
    saveRaw({
      v: 1,
      items: [item({ quantity: 15 }), item({ quantity: 15 }), item({ productId: "x", quantity: -3 })],
    });
    const { getEnquirySnapshot } = await load();
    expect(getEnquirySnapshot().items.map((i) => i.quantity)).toEqual([20, 1]);
  });
});

describe("storage failures", () => {
  it("still works in memory when localStorage throws", async () => {
    const storage = Object.getPrototypeOf(localStorage) as Storage;
    vi.spyOn(storage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { addEnquiryItem, getEnquirySnapshot } = await load();

    expect(() => addEnquiryItem(item())).not.toThrow();
    expect(getEnquirySnapshot().items).toHaveLength(1);
  });
});

describe("sync between tabs", () => {
  it("picks up changes made in another tab", async () => {
    const { getEnquirySnapshot, subscribeEnquiry } = await load();
    const listener = vi.fn();
    subscribeEnquiry(listener);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: JSON.stringify({ v: 1, items: [item({ quantity: 4 })] }),
      }),
    );

    expect(listener).toHaveBeenCalled();
    expect(getEnquirySnapshot().items[0].quantity).toBe(4);
  });

  it("empties the list when another tab clears storage", async () => {
    const { addEnquiryItem, getEnquirySnapshot, subscribeEnquiry } =
      await load();
    subscribeEnquiry(() => {});
    addEnquiryItem(item());

    window.dispatchEvent(new StorageEvent("storage", { key: null }));

    expect(getEnquirySnapshot().items).toEqual([]);
  });

  it("ignores changes to other storage keys", async () => {
    const { addEnquiryItem, getEnquirySnapshot, subscribeEnquiry } =
      await load();
    const listener = vi.fn();
    subscribeEnquiry(listener);
    addEnquiryItem(item());
    listener.mockClear();

    window.dispatchEvent(
      new StorageEvent("storage", { key: "something-else", newValue: "x" }),
    );

    expect(listener).not.toHaveBeenCalled();
    expect(getEnquirySnapshot().items).toHaveLength(1);
  });
});

describe("compactImage", () => {
  it("keeps only the fields the image builder needs", async () => {
    const { compactImage } = await load();
    expect(
      compactImage({
        alt: "Blade",
        crop: { top: 0, bottom: 0, left: 0, right: 0 },
        hotspot: null,
        asset: {
          _id: "image-abc",
          metadata: {
            lqip: "data:image/jpeg;base64,…",
            dimensions: { width: 800, height: 600, aspectRatio: 4 / 3 },
          },
        },
      }),
    ).toEqual({
      alt: "Blade",
      crop: { top: 0, bottom: 0, left: 0, right: 0 },
      hotspot: null,
      asset: {
        _id: "image-abc",
        metadata: { dimensions: { width: 800, height: 600, aspectRatio: 4 / 3 } },
      },
    });
  });

  it.each([
    ["null", null],
    ["no asset", { alt: "x" }],
    ["an empty asset id", { asset: { _id: "" } }],
  ])("returns null for %s", async (_label, value) => {
    const { compactImage } = await load();
    expect(compactImage(value)).toBeNull();
  });
});

describe("enquiryTotal / enquiryCount", () => {
  it("sums price × quantity and total pieces", async () => {
    const { enquiryTotal, enquiryCount } = await load();
    const items = [
      item({ unitPrice: 30000, quantity: 1 }),
      item({ productId: "b", unitPrice: 1500, quantity: 3 }),
    ];
    expect(enquiryTotal(items)).toBe(34500);
    expect(enquiryCount(items)).toBe(4);
    expect(enquiryTotal([])).toBe(0);
  });
});
