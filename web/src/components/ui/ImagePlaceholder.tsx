import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  /** Read by screen readers, e.g. the product name. Omit when decorative. */
  label?: string;
  /** Width / height of the box, e.g. 1 for square. Omit to fill the parent's height instead. */
  aspectRatio?: number;
  className?: string;
};

/**
 * Neutral stand-in for a missing photo: a paddle and ball on a soft background.
 * Pass `aspectRatio`, or place it in a parent that has a height.
 */
export function ImagePlaceholder({
  label,
  aspectRatio,
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center bg-slate-100 text-slate-300",
        !aspectRatio && "h-full",
        className,
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
      {...(label
        ? { role: "img", "aria-label": `${label} (photo coming soon)` }
        : { "aria-hidden": true })}
    >
      <svg
        viewBox="0 0 120 120"
        className="h-2/5 max-h-40 w-2/5 max-w-40"
        fill="none"
        aria-hidden
      >
        {/* paddle blade */}
        <ellipse
          cx="52"
          cy="50"
          rx="34"
          ry="36"
          transform="rotate(-35 52 50)"
          fill="currentColor"
        />
        {/* rubber edge */}
        <ellipse
          cx="52"
          cy="50"
          rx="28"
          ry="30"
          transform="rotate(-35 52 50)"
          stroke="white"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
        {/* handle */}
        <rect
          x="71"
          y="74"
          width="12"
          height="34"
          rx="5"
          transform="rotate(-35 77 91)"
          fill="currentColor"
        />
        {/* ball */}
        <circle cx="96" cy="28" r="9" fill="currentColor" />
      </svg>
    </div>
  );
}
