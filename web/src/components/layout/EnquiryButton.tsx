import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

/**
 * Header link to the enquiry list with an item count.
 * TODO(enquiry step): read the count from the localStorage enquiry store instead of the prop.
 */
export function EnquiryButton({ count = 0 }: { count?: number }) {
  return (
    <Link
      href="/enquiry/"
      aria-label={`Enquiry list, ${count} ${count === 1 ? "item" : "items"}`}
      className={buttonVariants({
        variant: "ghost",
        size: "icon",
        className: "relative",
      })}
    >
      <ClipboardList aria-hidden className="size-6!" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-pill bg-red px-1 text-[0.6875rem] leading-none font-medium text-white tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
