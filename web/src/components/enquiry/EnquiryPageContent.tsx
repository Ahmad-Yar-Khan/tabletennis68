"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { enquiryItemKey } from "@/lib/enquiry";
import { useEnquiryList } from "@/lib/hooks/useEnquiryList";
import { EnquiryEmptyState } from "./EnquiryEmptyState";
import { EnquiryLineItem } from "./EnquiryLineItem";
import { EnquirySummary } from "./EnquirySummary";

/** Body of the /enquiry page: items on the left, a sticky summary card on the right (desktop). */
export function EnquiryPageContent({
  whatsappNumber,
}: {
  whatsappNumber: string | null;
}) {
  const { ready, items, total } = useEnquiryList();

  if (!ready) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]" aria-busy>
        <Skeleton className="h-64 rounded-card" />
        <Skeleton className="h-56 rounded-card" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-card border-2 border-dashed border-line bg-white">
        <EnquiryEmptyState headingAs="h2" />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_24rem] lg:gap-8">
      <section
        aria-label="Items"
        className="rounded-card bg-white px-4 shadow-card sm:px-6"
      >
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <EnquiryLineItem
              key={enquiryItemKey(item.productId, item.options)}
              item={item}
            />
          ))}
        </ul>
      </section>
      <section
        aria-label="Summary"
        className="rounded-card bg-white p-4 shadow-card sm:p-6 lg:sticky lg:top-24"
      >
        <EnquirySummary
          items={items}
          total={total}
          whatsappNumber={whatsappNumber}
        />
      </section>
    </div>
  );
}
