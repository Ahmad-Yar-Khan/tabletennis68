"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { clearEnquiryList } from "@/lib/enquiry";
import type { EnquiryItem } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { buildWhatsAppLink, enquiryListMessage } from "@/lib/whatsapp";

type EnquirySummaryProps = {
  items: EnquiryItem[];
  total: number;
  whatsappNumber: string | null;
  className?: string;
};

/** "sent": asked after sending; "clear": the customer pressed "Clear list". */
type Prompt = "sent" | "clear" | null;

/**
 * Estimated total, the "Send list on WhatsApp" button, and the clear-list prompt.
 * The list is never cleared automatically: after sending we ask first.
 */
export function EnquirySummary({
  items,
  total,
  whatsappNumber,
  className,
}: EnquirySummaryProps) {
  const [prompt, setPrompt] = useState<Prompt>(null);
  const hintId = useId();
  const pieces = items.reduce((sum, i) => sum + i.quantity, 0);

  const sendLabel = (
    <>
      <WhatsAppIcon />
      Send list on WhatsApp
    </>
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-muted">
          Estimated total{" "}
          <span className="text-sm tabular-nums">
            ({pieces} {pieces === 1 ? "item" : "items"})
          </span>
        </p>
        <p className="text-2xl font-medium text-ink tabular-nums">
          {formatPrice(total)}
        </p>
      </div>
      <p className="text-sm text-muted">
        Final price and delivery charges will be confirmed on WhatsApp.
      </p>

      {whatsappNumber ? (
        <Button
          variant="whatsapp"
          size="lg"
          fullWidth
          href={buildWhatsAppLink(whatsappNumber, enquiryListMessage(items))}
          onClick={() => setPrompt("sent")}
        >
          {sendLabel}
        </Button>
      ) : (
        <>
          <Button
            variant="whatsapp"
            size="lg"
            fullWidth
            disabled
            aria-describedby={hintId}
          >
            {sendLabel}
          </Button>
          <p id={hintId} className="text-sm text-crimson">
            WhatsApp ordering is not available right now. Please call or email
            us instead.
          </p>
        </>
      )}

      {/* Announced politely when it appears. */}
      <div aria-live="polite">
        {prompt ? (
          <div className="rounded-xl bg-blush p-3.5">
            <p className="font-medium text-ink">
              {prompt === "sent"
                ? "Sent your list? Clear your list?"
                : "Remove all items from your list?"}
            </p>
            {prompt === "sent" && (
              <p className="mt-0.5 text-sm text-muted">
                Keep it if you still want to change something.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  clearEnquiryList();
                  setPrompt(null);
                }}
              >
                Yes, clear list
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPrompt(null)}
              >
                {prompt === "sent" ? "Keep it" : "Cancel"}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPrompt("clear")}
            className="mx-auto block min-h-11 rounded-md px-2 text-sm text-muted underline-offset-4 transition-colors hover:text-crimson hover:underline"
          >
            Clear list
          </button>
        )}
      </div>
    </div>
  );
}
