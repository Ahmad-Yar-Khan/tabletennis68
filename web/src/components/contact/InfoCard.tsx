import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White card with an icon badge and a heading, used for the delivery block. */
export function InfoCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-line bg-white p-5 sm:p-6",
        className,
      )}
    >
      <h2 className="mb-4 flex items-center gap-3 text-2xl uppercase">
        <span
          aria-hidden
          className="inline-flex size-10 shrink-0 -skew-x-6 items-center justify-center rounded-lg bg-blush text-crimson"
        >
          <Icon className="size-5 skew-x-6" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
