import type { SVGProps } from "react";

/** Table tennis table with net, in lucide's 24px stroke style (lucide's "table" is a spreadsheet). */
export function TableIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M2 10h20l-2 4H4Z" />
      <path d="M12 6v4" />
      <path d="M6 14v6" />
      <path d="M18 14v6" />
    </svg>
  );
}
