/*
 * Node 25+ ships its own global `localStorage`/`sessionStorage` (unusable without
 * --localstorage-file), which shadows jsdom's. Point the globals back at jsdom's storage.
 */
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom;

if (dom) {
  for (const key of ["localStorage", "sessionStorage"] as const) {
    Object.defineProperty(globalThis, key, {
      value: dom.window[key],
      configurable: true,
      writable: true,
    });
  }
}
