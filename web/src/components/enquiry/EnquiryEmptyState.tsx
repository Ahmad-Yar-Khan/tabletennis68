import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/Button";

type EnquiryEmptyStateProps = {
  /** Called when the shop link is followed (e.g. to close the drawer). */
  onNavigate?: () => void;
  /** Heading level that fits the surrounding page outline. */
  headingAs?: "h2" | "h3";
};

/** Shown when the enquiry list has no items. */
export function EnquiryEmptyState({
  onNavigate,
  headingAs: Heading = "h2",
}: EnquiryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-blush text-crimson">
        <ClipboardList aria-hidden className="size-7" />
      </span>
      <Heading className="text-3xl uppercase">Your list is empty</Heading>
      <p className="mt-2 max-w-xs text-muted">
        Add products while you browse, then send the whole list to us on
        WhatsApp in one message.
      </p>
      <Button href="/shop/" onClick={onNavigate} className="mt-6">
        Browse the shop
      </Button>
    </div>
  );
}
