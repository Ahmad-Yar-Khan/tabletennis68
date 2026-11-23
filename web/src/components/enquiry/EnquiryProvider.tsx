"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useHasOpened } from "@/lib/hooks/useHasOpened";
import { EnquiryToast, type ToastData } from "./EnquiryToast";

// The drawer (and Motion, which animates it) is downloaded the first time the list is opened.
const loadDrawer = () => import("./EnquiryDrawer");
const EnquiryDrawer = dynamic(
  () => loadDrawer().then((mod) => mod.EnquiryDrawer),
  { ssr: false },
);

/** Start downloading the enquiry drawer early, e.g. when the header button is hovered. */
export function preloadEnquiryDrawer(): void {
  void loadDrawer();
}

type EnquiryUI = {
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Shows the "Added to your list" toast. */
  notifyAdded: (toast: Omit<ToastData, "id">) => void;
};

const EnquiryUIContext = createContext<EnquiryUI | null>(null);

/** Drawer and toast controls for the enquiry list. Use inside <EnquiryProvider>. */
export function useEnquiryUI(): EnquiryUI {
  const ctx = useContext(EnquiryUIContext);
  if (!ctx) throw new Error("useEnquiryUI must be used inside EnquiryProvider");
  return ctx;
}

type EnquiryProviderProps = {
  whatsappNumber: string | null;
  children: ReactNode;
};

/**
 * Wraps the site once (in the root layout) and renders the enquiry drawer and the
 * "Added to your list" toast. The list itself lives in the localStorage store (lib/enquiry.ts).
 */
export function EnquiryProvider({
  whatsappNumber,
  children,
}: EnquiryProviderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const drawerMounted = useHasOpened(drawerOpen);

  const openDrawer = useCallback(() => {
    setToast(null);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const notifyAdded = useCallback(
    (data: Omit<ToastData, "id">) => setToast({ ...data, id: Date.now() }),
    [],
  );

  const value = useMemo(
    () => ({ openDrawer, closeDrawer, notifyAdded }),
    [openDrawer, closeDrawer, notifyAdded],
  );

  return (
    <EnquiryUIContext.Provider value={value}>
      {children}
      {drawerMounted && (
        <EnquiryDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          whatsappNumber={whatsappNumber}
        />
      )}
      <EnquiryToast
        toast={toast}
        onDismiss={dismissToast}
        onViewList={openDrawer}
      />
    </EnquiryUIContext.Provider>
  );
}
