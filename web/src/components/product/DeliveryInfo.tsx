import { Truck } from "lucide-react";
import Link from "next/link";

/** Delivery note from Site settings, shown under the order buttons. */
export function DeliveryInfo({ text }: { text: string | null }) {
  if (!text?.trim()) return null;

  return (
    <aside
      aria-label="Delivery"
      className="flex gap-3 rounded-card border border-line bg-white p-4"
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush text-crimson"
      >
        <Truck className="size-5" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="mb-1 font-medium text-ink">Delivery</p>
        <p className="whitespace-pre-line text-muted">{text}</p>
        <Link
          href="/contact/"
          className="mt-2 inline-block font-medium text-crimson transition-colors hover:text-ink"
        >
          Contact &amp; store details
        </Link>
      </div>
    </aside>
  );
}
