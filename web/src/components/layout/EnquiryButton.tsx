"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import {
  preloadEnquiryDrawer,
  useEnquiryUI,
} from "@/components/enquiry/EnquiryProvider";
import { buttonVariants } from "@/components/ui/Button";
import { useEnquiryList } from "@/lib/hooks/useEnquiryList";

/**
 * Header icon for the enquiry list, with an item-count badge. Opens the drawer;
 * it is a real link to /enquiry/ so it also works before JavaScript loads
 * (and with Ctrl/Cmd-click). The count is 0 in the static HTML and appears after hydration.
 */
export function EnquiryButton() {
  const { count } = useEnquiryList();
  const { openDrawer } = useEnquiryUI();
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      pathname === "/enquiry/" ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    openDrawer();
  }

  return (
    <Link
      href="/enquiry/"
      onClick={handleClick}
      // The drawer is loaded on demand; start the download on intent.
      onPointerDown={preloadEnquiryDrawer}
      onPointerEnter={preloadEnquiryDrawer}
      onFocus={preloadEnquiryDrawer}
      aria-label={`Enquiry list, ${count} ${count === 1 ? "item" : "items"}`}
      className={buttonVariants({
        variant: "ghost",
        size: "icon",
        className: "relative",
      })}
    >
      <ClipboardList aria-hidden className="size-6!" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-pill bg-red px-1 text-[0.6875rem] leading-none font-medium text-white tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
