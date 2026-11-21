"use client";

import { CircleCheck, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";

export type ToastData = {
  /** Changes on every add, so the timer restarts. */
  id: number;
  productName: string;
  /** Set when the quantity hit the per-item limit. */
  note?: string;
};

type EnquiryToastProps = {
  toast: ToastData | null;
  onDismiss: () => void;
  onViewList: () => void;
};

const DURATION_MS = 5000;

/**
 * "Added to your list" message with a "View list" action. Sits bottom-left on phones
 * (clear of the floating WhatsApp button) and bottom-centre on larger screens.
 * Auto-hides after 5 s, paused while hovered or focused.
 */
export function EnquiryToast({
  toast,
  onDismiss,
  onViewList,
}: EnquiryToastProps) {
  // Pause is tied to one toast, so a new toast never inherits a stale "paused".
  const [pausedId, setPausedId] = useState<number | null>(null);
  const paused = toast !== null && pausedId === toast.id;

  useEffect(() => {
    if (!toast || paused) return;
    const timer = window.setTimeout(onDismiss, DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast, paused, onDismiss]);

  return (
    // Always mounted so screen readers announce new content.
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom)+var(--fab-offset,0px))] z-40 flex justify-start pr-16 sm:inset-x-0 sm:bottom-[calc(1.5rem+var(--fab-offset,0px))] sm:justify-center sm:px-24"
    >
      <AnimatePresence>
        {toast && (
          <m.div
            key={toast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            onPointerEnter={() => setPausedId(toast.id)}
            onPointerLeave={() => setPausedId(null)}
            onFocus={() => setPausedId(toast.id)}
            onBlur={() => setPausedId(null)}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card bg-ink py-2.5 pr-2 pl-3.5 text-white shadow-lift"
          >
            <CircleCheck aria-hidden className="size-5 shrink-0 text-whatsapp" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Added to your list</p>
              <p className="truncate text-xs text-muted-light">
                {toast.note ?? toast.productName}
              </p>
            </div>
            <button
              type="button"
              onClick={onViewList}
              className="inline-flex h-9 shrink-0 items-center rounded-pill bg-red px-3.5 text-sm font-medium text-white transition-colors hover:bg-crimson"
            >
              View list
            </button>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-light transition-colors hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden className="size-4" />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
