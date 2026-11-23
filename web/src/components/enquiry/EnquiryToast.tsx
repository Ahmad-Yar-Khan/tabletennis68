"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useHasOpened } from "@/lib/hooks/useHasOpened";

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

// The animated card (and Motion) is downloaded the first time something is added.
const EnquiryToastCard = dynamic(
  () => import("./EnquiryToastCard").then((mod) => mod.EnquiryToastCard),
  { ssr: false },
);

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
  const mounted = useHasOpened(toast !== null);

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
      {mounted && (
        <EnquiryToastCard
          toast={toast}
          onDismiss={onDismiss}
          onViewList={onViewList}
          onPause={setPausedId}
          onResume={() => setPausedId(null)}
        />
      )}
    </div>
  );
}
