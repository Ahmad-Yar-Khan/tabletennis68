import Link from "next/link";
import type { Brand, Category } from "@/lib/types";

type ShopShortcutsProps = {
  categories: Category[];
  brands: Brand[];
};

const chipClass =
  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border border-line bg-white px-4 text-sm font-medium whitespace-nowrap text-ink transition-colors hover:border-red hover:text-crimson";

/**
 * Links from /shop to every category and brand page that has products.
 * One swipeable row each on phones, wrapping rows on larger screens.
 */
export function ShopShortcuts({ categories, brands }: ShopShortcutsProps) {
  const rows = [
    {
      id: "shop-categories",
      title: "Categories",
      items: categories
        .filter((c) => c.productCount > 0)
        .map((c) => ({
          key: c._id,
          href: `/category/${c.slug}/`,
          name: c.name,
          count: c.productCount,
        })),
    },
    {
      id: "shop-brands",
      title: "Brands",
      items: brands
        .filter((b) => b.productCount > 0)
        .map((b) => ({
          key: b._id,
          href: `/brand/${b.slug}/`,
          name: b.name,
          count: b.productCount,
        })),
    },
  ].filter((row) => row.items.length > 0);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <nav
          key={row.id}
          aria-labelledby={row.id}
          className="flex items-center gap-3"
        >
          <h2
            id={row.id}
            className="hidden w-24 shrink-0 font-display text-lg font-bold tracking-wide text-muted uppercase italic sm:block"
          >
            {row.title}
          </h2>
          <ul className="-mx-4 flex min-w-0 flex-1 [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {row.items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={chipClass}>
                  {item.name}
                  <span className="text-xs text-muted tabular-nums">
                    {item.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
  );
}
