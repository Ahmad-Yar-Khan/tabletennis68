import { ChevronDown } from "lucide-react";

type ShowMoreProps = {
  shown: number;
  total: number;
  /** Omit in the static (pre-JavaScript) version: then only the progress line shows. */
  onShowMore?: () => void;
};

/** "Showing 24 of 57" with a progress bar and a "Show 33 more" button (remaining count) below the product grid. */
export function ShowMore({ shown, total, onShowMore }: ShowMoreProps) {
  if (shown >= total) return null;
  const remaining = total - shown;

  return (
    <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
      <p className="text-sm text-muted tabular-nums">
        Showing <span className="font-medium text-ink">{shown}</span> of{" "}
        {total}
      </p>
      <div aria-hidden className="h-1 w-48 overflow-hidden rounded-pill bg-line">
        <div
          className="h-full origin-left rounded-pill bg-red"
          style={{ transform: `scaleX(${shown / total})` }}
        />
      </div>
      {onShowMore && (
        <button
          type="button"
          onClick={onShowMore}
          className="mt-1 inline-flex h-12 items-center gap-2 rounded-pill border-2 border-ink px-6 font-medium text-ink transition-colors hover:bg-ink hover:text-white active:scale-[0.98]"
        >
          Show {remaining} more
          <ChevronDown aria-hidden className="size-5" />
        </button>
      )}
    </div>
  );
}
