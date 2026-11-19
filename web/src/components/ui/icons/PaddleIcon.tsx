import type { SVGProps } from "react";

/** Table tennis paddle and ball, drawn to match lucide's 24px stroke style (lucide has none). */
export function PaddleIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M13.5 13.5a6 6 0 1 0-8.49-8.49 6 6 0 0 0 8.49 8.49Z" />
      <path d="m13.5 13.5 1.4 1.4" />
      <path d="m14.2 16.3 2.1-2.1 5 5a1.5 1.5 0 0 1-2.1 2.1Z" />
      <circle cx="19" cy="5" r="2" />
    </svg>
  );
}
