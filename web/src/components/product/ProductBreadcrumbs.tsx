import Link from "next/link";

export type Crumb = { href: string; label: string };

/** Breadcrumb trail on a light background. The last item is the current page (not a link). */
export function ProductBreadcrumbs({
  crumbs,
  current,
}: {
  crumbs: Crumb[];
  current: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex min-w-0 items-center gap-1.5 text-muted">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex shrink-0 items-center gap-1.5">
            <Link
              href={crumb.href}
              className="rounded-sm transition-colors hover:text-crimson"
            >
              {crumb.label}
            </Link>
            <span aria-hidden>›</span>
          </li>
        ))}
        <li className="min-w-0">
          <span aria-current="page" className="block truncate text-ink">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
