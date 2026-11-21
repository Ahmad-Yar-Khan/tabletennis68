"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SanityImage } from "@/components/ui/SanityImage";
import {
  MAX_ITEM_QTY,
  enquiryItemKey,
  removeEnquiryItem,
  updateEnquiryQuantity,
} from "@/lib/enquiry";
import type { EnquiryItem } from "@/lib/types";
import { formatPrice, productPath } from "@/lib/utils";

type EnquiryLineItemProps = {
  item: EnquiryItem;
  /** Called when a product link is followed (e.g. to close the drawer). */
  onNavigate?: () => void;
};

/** One row of the enquiry list: photo, name, options, price, qty stepper and remove. */
export function EnquiryLineItem({ item, onNavigate }: EnquiryLineItemProps) {
  const key = enquiryItemKey(item.productId, item.options);
  const href = productPath(item.slug);
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      <Link
        href={href}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden
        className="size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-white sm:size-24"
      >
        <SanityImage
          image={item.image}
          width={96}
          aspectRatio={1}
          className="size-full"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={href}
              onClick={onNavigate}
              className="line-clamp-2 font-medium text-ink transition-colors hover:text-crimson"
            >
              {item.name}
            </Link>
            {item.options.length > 0 && (
              <p className="mt-0.5 text-sm text-muted">
                {item.options.map((o) => `${o.name}: ${o.value}`).join(" · ")}
              </p>
            )}
            <p className="mt-0.5 text-sm text-muted tabular-nums">
              {formatPrice(item.unitPrice)} each
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeEnquiryItem(key)}
            aria-label={`Remove ${item.name} from your list`}
            className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-blush hover:text-crimson"
          >
            <Trash2 aria-hidden className="size-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            onChange={(qty) => updateEnquiryQuantity(key, qty)}
            min={1}
            max={MAX_ITEM_QTY}
            label={`Quantity of ${item.name}`}
          />
          <p className="font-medium text-ink tabular-nums">
            {formatPrice(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}
