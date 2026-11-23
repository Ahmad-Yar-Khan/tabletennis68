"use client";

import { CircleCheck, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import type { ToastData } from "./EnquiryToast";

export type EnquiryToastCardProps = {
  toast: ToastData | null;
  onDismiss: () => void;
  onViewList: () => void;
  /** Hover/focus pauses the auto-hide timer. */
  onPause: (id: number) => void;
  onResume: () => void;
};

/** The animated "Added to your list" card. Loaded on demand by <EnquiryToast>. */
export function EnquiryToastCard({
  toast,
  onDismiss,
  onViewList,
  onPause,
  onResume,
}: EnquiryToastCardProps) {
  return (
    <AnimatePresence>
      {toast && (
        <m.div
          key={toast.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
          onPointerEnter={() => onPause(toast.id)}
          onPointerLeave={onResume}
          onFocus={() => onPause(toast.id)}
          onBlur={onResume}
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
  );
}
