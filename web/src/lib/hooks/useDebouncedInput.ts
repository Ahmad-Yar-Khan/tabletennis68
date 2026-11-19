"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  delay?: number;
  /** Turns what's typed into the committed value (e.g. trim). Defaults to trim. */
  normalise?: (value: string) => string;
};

const trim = (value: string) => value.trim();

/**
 * A text input value that commits after the user pauses typing.
 * Keystrokes only re-render the component holding the input; `commit` runs once per pause.
 * When `external` changes from elsewhere (Back button, "Clear all", a chip ×), the input follows,
 * unless it already shows the same value (so a trailing space being typed isn't wiped).
 */
export function useDebouncedInput(
  external: string,
  commit: (value: string) => void,
  { delay = 300, normalise = trim }: Options = {},
) {
  const [value, setValue] = useState(external);
  const [prevExternal, setPrevExternal] = useState(external);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const commitRef = useRef(commit);

  useEffect(() => {
    commitRef.current = commit;
  }, [commit]);

  // Adjust state during render when the outside value changes (React's recommended pattern).
  if (external !== prevExternal) {
    setPrevExternal(external);
    if (normalise(value) !== external) setValue(external);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = useCallback(
    (next: string) => {
      setValue(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(
        () => commitRef.current(normalise(next)),
        delay,
      );
    },
    [delay, normalise],
  );

  /** Commit right away (Enter, blur). */
  const flush = useCallback(
    (current: string) => {
      clearTimeout(timer.current);
      commitRef.current(normalise(current));
    },
    [normalise],
  );

  return { value, onChange, flush, setValue } as const;
}
