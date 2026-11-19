import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type EmptyResultsProps = {
  query: string;
  whatsappNumber: string | null;
  onReset: () => void;
};

/** Shown when no product matches: reset button plus "ask us on WhatsApp". */
export function EmptyResults({
  query,
  whatsappNumber,
  onReset,
}: EmptyResultsProps) {
  const message = query
    ? `Hi! I'm looking for "${query}". Do you have it?`
    : "Hi! I couldn't find what I'm looking for on your website. Can you help?";

  return (
    <div className="flex flex-col items-center rounded-card border-2 border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-blush text-crimson">
        <SearchX aria-hidden className="size-7" />
      </span>
      <h2 className="text-3xl uppercase">No products found</h2>
      <p className="mt-2 max-w-sm text-muted">
        {query ? (
          <>
            Nothing matches{" "}
            <strong className="font-medium text-ink">“{query}”</strong> with
            these filters. Try fewer filters or a different word.
          </>
        ) : (
          "Nothing matches these filters. Try removing some of them."
        )}
      </p>
      <Button variant="outline" onClick={onReset} className="mt-6">
        Reset filters
      </Button>
      {whatsappNumber && (
        <div className="mt-8 border-t border-line pt-6">
          <p className="font-medium">Can’t find it? Ask us on WhatsApp</p>
          <p className="mt-1 text-sm text-muted">
            We can often get items that aren’t listed yet.
          </p>
          <Button
            variant="whatsapp"
            href={buildWhatsAppLink(whatsappNumber, message)}
            className="mt-4"
          >
            <WhatsAppIcon />
            Ask on WhatsApp
          </Button>
        </div>
      )}
    </div>
  );
}
