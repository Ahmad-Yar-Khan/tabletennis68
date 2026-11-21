"use client";

import { useSyncExternalStore } from "react";
import {
  enquiryCount,
  enquiryTotal,
  getEnquiryServerSnapshot,
  getEnquirySnapshot,
  subscribeEnquiry,
} from "@/lib/enquiry";

/**
 * The enquiry list from localStorage. On the server and during hydration it is empty
 * with `ready: false`, so the HTML always matches; it fills in right after hydration.
 * Change it with the actions in `@/lib/enquiry` (addEnquiryItem, removeEnquiryItem, …).
 */
export function useEnquiryList() {
  const { ready, items } = useSyncExternalStore(
    subscribeEnquiry,
    getEnquirySnapshot,
    getEnquiryServerSnapshot,
  );
  return {
    ready,
    items,
    count: enquiryCount(items),
    total: enquiryTotal(items),
  };
}
