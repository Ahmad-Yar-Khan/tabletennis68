"use client";

import { X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

export type DrawerSide = "left" | "right" | "top" | "bottom";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Heading of the panel; also its accessible name. */
  title: string;
  /** Keep the title for screen readers only. */
  hideTitle?: boolean;
  side?: DrawerSide;
  children: ReactNode;
  /** Pinned to the bottom of the panel (e.g. action buttons). */
  footer?: ReactNode;
  /** Element to focus when the drawer opens (default: the first focusable, i.e. Close). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
};

const panelPosition: Record<DrawerSide, string> = {
  left: "inset-y-0 left-0 h-full w-[min(22rem,88vw)]",
  right: "inset-y-0 right-0 h-full w-[min(24rem,92vw)]",
  top: "inset-x-0 top-0 max-h-[85dvh]",
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-card",
};

const offscreen: Record<DrawerSide, { x?: string; y?: string }> = {
  left: { x: "-100%" },
  right: { x: "100%" },
  top: { y: "-100%" },
  bottom: { y: "100%" },
};

const transition = {
  type: "tween",
  duration: 0.28,
  ease: [0.32, 0.72, 0, 1],
} as const;

const noopSubscribe = () => () => {};

/**
 * Slide-over panel (menu, enquiry list, mobile filters, search).
 * Accessible modal: focus is trapped inside, Esc and the backdrop close it,
 * page scroll is locked, and focus returns to the opener on close.
 */
export function Drawer({
  open,
  onClose,
  title,
  hideTitle = false,
  side = "right",
  children,
  footer,
  initialFocusRef,
  className,
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Portals need `document`, which only exists in the browser.
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useFocusTrap(panelRef, open, { onEscape: onClose, initialFocusRef });

  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const prev = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, [open]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" key="drawer">
          <m.div
            aria-hidden
            className="absolute inset-0 bg-ink/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={cn(
              "absolute flex flex-col bg-surface shadow-lift outline-none",
              panelPosition[side],
              className,
            )}
            initial={offscreen[side]}
            animate={{ x: 0, y: 0 }}
            exit={offscreen[side]}
            transition={transition}
          >
            <div
              className={cn(
                "flex items-center justify-between gap-4 px-4 py-3",
                !hideTitle && "border-b border-line",
                hideTitle && "absolute top-0 right-0 z-10",
              )}
            >
              <h2
                id={titleId}
                className={cn("text-2xl uppercase", hideTitle && "sr-only")}
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
              >
                <X aria-hidden className="size-6" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
            {footer && (
              <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
