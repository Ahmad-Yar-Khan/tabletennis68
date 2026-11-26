"use client";

import { ClipboardList } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useEnquiryUI } from "@/components/enquiry/EnquiryProvider";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { MAX_ITEM_QTY, addEnquiryItem } from "@/lib/enquiry";
import type {
  EnquiryItem,
  ProductOption,
  SanityImage,
  SelectedOption,
} from "@/lib/types";
import { formatPrice, getEffectivePrice, isOnSale } from "@/lib/utils";
import {
  buildWhatsAppLink,
  productOrderMessage,
  restockMessage,
} from "@/lib/whatsapp";
import { OptionSelector } from "./OptionSelector";

export type PurchaseProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  inStock: boolean;
  /** Only options that have at least one value. */
  options: ProductOption[];
  /** Main photo, saved with the item in the enquiry list. */
  image: SanityImage | null;
};

type ProductPurchaseProps = {
  product: PurchaseProduct;
  whatsappNumber: string | null;
};

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/**
 * Everything the customer interacts with on a product page: option pills, quantity,
 * "Order on WhatsApp" (or "Ask about restock"), "Add to order list", and on phones a
 * sticky bottom bar that appears once the main button has scrolled out of view.
 */
export function ProductPurchase({
  product,
  whatsappNumber,
}: ProductPurchaseProps) {
  const { name, slug, inStock, options } = product;
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [attention, setAttention] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const { notifyAdded } = useEnquiryUI();

  const unitPrice = getEffectivePrice(product);
  const missing = options.filter((o) => !selected[o._key]);
  const complete = missing.length === 0;
  const chosen: SelectedOption[] = options
    .filter((o) => selected[o._key])
    .map((o) => ({ name: o.name, value: selected[o._key] }));

  const message = inStock
    ? productOrderMessage({ name, slug, unitPrice, options: chosen, quantity })
    : restockMessage({ name, slug, options: chosen });
  const canMessage = Boolean(whatsappNumber) && (complete || !inStock);
  const waLink = canMessage
    ? buildWhatsAppLink(whatsappNumber!, message)
    : null;
  const buttonLabel = inStock ? "Order on WhatsApp" : "Ask about restock";

  const hint = !whatsappNumber
    ? "WhatsApp ordering is not available right now. Please call or email us instead."
    : inStock && !complete
      ? `Select ${listFormat.format(missing.map((o) => o.name.toLowerCase()))} to order.`
      : null;

  // Show the sticky bar (phones/tablets only) once the main buttons are above the screen.
  useEffect(() => {
    const target = actionsRef.current;
    if (!target) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const observer = new IntersectionObserver(([entry]) => {
      setShowBar(
        !desktop.matches &&
          !entry.isIntersecting &&
          entry.boundingClientRect.top < 0,
      );
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Lift the floating WhatsApp button above the bar while it is showing.
  useEffect(() => {
    if (!showBar) return;
    document.body.style.setProperty("--fab-offset", "4.75rem");
    return () => {
      document.body.style.removeProperty("--fab-offset");
    };
  }, [showBar]);

  function choose(option: ProductOption, value: string) {
    setSelected((prev) => ({ ...prev, [option._key]: value }));
  }

  /** From the sticky bar: scroll to the first option still to choose and focus it. */
  function showFirstMissing() {
    setAttention(true);
    const first = missing[0];
    const fieldset = rootRef.current?.querySelector<HTMLElement>(
      `[data-option="${first?._key}"]`,
    );
    if (!fieldset) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    fieldset.scrollIntoView({
      block: "center",
      behavior: reduce ? "auto" : "smooth",
    });
    fieldset.querySelector("input")?.focus({ preventScroll: true });
  }

  function handleAddToEnquiry() {
    if (!complete) return;
    const item: EnquiryItem = {
      productId: product._id,
      slug,
      name,
      image: product.image,
      unitPrice,
      options: chosen,
      quantity,
    };
    const { capped } = addEnquiryItem(item);
    notifyAdded({
      productName: name,
      note: capped
        ? `${name}: limited to ${MAX_ITEM_QTY} per item`
        : undefined,
    });
  }

  const orderButton = waLink ? (
    <Button href={waLink} variant="whatsapp" size="lg" fullWidth>
      <WhatsAppIcon />
      {buttonLabel}
    </Button>
  ) : (
    <Button
      variant="whatsapp"
      size="lg"
      fullWidth
      disabled
      aria-describedby={hintId}
    >
      <WhatsAppIcon />
      {buttonLabel}
    </Button>
  );

  return (
    <div ref={rootRef} className="flex flex-col gap-6">
      {options.length > 0 && (
        <div className="flex flex-col gap-5">
          {options.map((option) => (
            <OptionSelector
              key={option._key}
              option={option}
              value={selected[option._key]}
              onChange={(value) => choose(option, value)}
              attention={attention}
            />
          ))}
        </div>
      )}

      {inStock && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm font-medium text-ink">Quantity</span>
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={MAX_ITEM_QTY}
            label={`Quantity of ${name}`}
          />
          {quantity > 1 && (
            <span className="text-sm text-muted tabular-nums">
              Total {formatPrice(unitPrice * quantity)}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <div ref={actionsRef} className="flex flex-col gap-2.5">
          {orderButton}
          {inStock && (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleAddToEnquiry}
              disabled={!complete}
              aria-describedby={hint ? hintId : undefined}
            >
              <ClipboardList aria-hidden />
              Add to order list
            </Button>
          )}
        </div>
        <p
          id={hintId}
          aria-live="polite"
          className={hint ? "text-sm text-crimson" : "sr-only"}
        >
          {hint}
        </p>
        {!inStock && (
          <p className="text-sm text-muted">
            Message us and we&apos;ll let you know when it&apos;s back.
          </p>
        )}
      </div>

      <AnimatePresence>
        {showBar && (
          <m.div
            key="sticky-bar"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "tween",
              duration: 0.25,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-header backdrop-blur lg:hidden"
          >
            <div className="mx-auto flex max-w-site items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">{name}</p>
                <p className="flex items-baseline gap-1.5 tabular-nums">
                  <span
                    className={
                      isOnSale(product)
                        ? "font-medium text-red"
                        : "font-medium text-ink"
                    }
                  >
                    {formatPrice(unitPrice)}
                  </span>
                  {isOnSale(product) && (
                    <s className="text-xs text-muted">
                      <span className="sr-only">Was </span>
                      {formatPrice(product.price)}
                    </s>
                  )}
                </p>
              </div>
              {inStock && !complete && whatsappNumber ? (
                <Button variant="primary" onClick={showFirstMissing}>
                  Select {missing[0].name.toLowerCase()}
                </Button>
              ) : waLink ? (
                <Button href={waLink} variant="whatsapp">
                  <WhatsAppIcon />
                  {inStock ? "Order" : "Ask about restock"}
                  <span className="sr-only"> on WhatsApp</span>
                </Button>
              ) : null}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
