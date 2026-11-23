"use client";

import { useState } from "react";

/**
 * True from the first time `open` is true, and stays true.
 * Used to mount a lazily loaded panel (drawer, dropdown, toast) only once it is first needed,
 * then keep it mounted so its closing animation can still play.
 */
export function useHasOpened(open: boolean): boolean {
  const [opened, setOpened] = useState(open);
  // Adjusting state during render (React's documented pattern for derived state).
  if (open && !opened) setOpened(true);
  return opened || open;
}
