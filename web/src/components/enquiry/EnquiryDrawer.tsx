"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Skeleton";
import { enquiryItemKey } from "@/lib/enquiry";
import { useEnquiryList } from "@/lib/hooks/useEnquiryList";
import { EnquiryEmptyState } from "./EnquiryEmptyState";
import { EnquiryLineItem } from "./EnquiryLineItem";
import { EnquirySummary } from "./EnquirySummary";

type EnquiryDrawerProps = {
  open: boolean;
  onClose: () => void;
  whatsappNumber: string | null;
};

/** Slide-over (from the right) with the enquiry list, total and "Send list on WhatsApp". */
export function EnquiryDrawer({
  open,
  onClose,
  whatsappNumber,
}: EnquiryDrawerProps) {
  const { ready, items, total } = useEnquiryList();
  const hasItems = items.length > 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Your list"
      side="right"
      className="w-[min(28rem,100vw)]"
      footer={
        hasItems ? (
          <EnquirySummary
            items={items}
            total={total}
            whatsappNumber={whatsappNumber}
          />
        ) : undefined
      }
    >
      {!ready ? (
        <div className="flex flex-col gap-4 p-4" aria-busy>
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : hasItems ? (
        <div className="px-4">
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <EnquiryLineItem
                key={enquiryItemKey(item.productId, item.options)}
                item={item}
                onNavigate={onClose}
              />
            ))}
          </ul>
          <Link
            href="/enquiry/"
            onClick={onClose}
            className="mb-4 inline-flex min-h-11 items-center gap-1 rounded-md text-sm font-medium text-crimson transition-colors hover:text-ink"
          >
            Open full list page
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      ) : (
        <EnquiryEmptyState onNavigate={onClose} headingAs="h3" />
      )}
    </Drawer>
  );
}
