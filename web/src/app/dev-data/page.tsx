// TEMPORARY: proves build-time Sanity fetching works. Delete this route before launch.
import type { Metadata } from "next";
import { SanityImage } from "@/components/ui/SanityImage";
import { sanityFetch } from "@/lib/sanity/client";
import {
  activeBannersQuery,
  allProductsQuery,
  brandsQuery,
  categoriesQuery,
  productBySlugQuery,
  siteSettingsQuery,
} from "@/lib/sanity/queries";
import type {
  Banner,
  Brand,
  Category,
  ProductDetail,
  ProductListItem,
  SiteSettings,
} from "@/lib/types";
import {
  formatPrice,
  getDiscountPercent,
  getEffectivePrice,
} from "@/lib/utils";
import { buildWhatsAppLink, productOrderMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Dev data",
  robots: { index: false, follow: false },
};

export default async function DevDataPage() {
  const [products, categories, brands, banners, settings] = await Promise.all([
    sanityFetch<ProductListItem[]>(allProductsQuery),
    sanityFetch<Category[]>(categoriesQuery),
    sanityFetch<Brand[]>(brandsQuery),
    sanityFetch<Banner[]>(activeBannersQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ]);
  const first = products[0];
  const detail = first
    ? await sanityFetch<ProductDetail | null>(productBySlugQuery, {
        slug: first.slug,
      })
    : null;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 text-sm">
      <h1 className="text-2xl font-bold">Dev data (build-time fetch)</h1>

      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Products ({products.length})
        </h2>
        <ul className="space-y-1">
          {products.map((p) => (
            <li key={p._id} data-testid="product">
              <strong>{p.name}</strong> · {p.category?.name ?? "No category"} ·{" "}
              {p.brand?.name ?? "No brand"} ·{" "}
              {formatPrice(getEffectivePrice(p))}
              {getDiscountPercent(p) > 0 && ` (${getDiscountPercent(p)}% off)`}
              {!p.inStock && " · Out of stock"} · image:{" "}
              {p.image ? "yes" : "none"}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Categories ({categories.length})
        </h2>
        <ul>
          {categories.map((c) => (
            <li key={c._id}>
              {c.name} (/{c.slug}) · {c.productCount} products
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Brands ({brands.length}) · Active banners ({banners.length})
        </h2>
        <p>{brands.map((b) => b.name).join(", ")}</p>
      </section>

      {detail && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Detail query: {detail.name}
          </h2>
          <div className="w-48 overflow-hidden rounded-xl">
            <SanityImage
              image={detail.images?.[0]}
              width={400}
              aspectRatio={1}
              fallbackAlt={detail.name}
            />
          </div>
          <p>
            Options:{" "}
            {detail.options
              ?.map((o) => `${o.name} [${o.values.join(", ")}]`)
              .join("; ") || "none"}
          </p>
          <p>
            Specs:{" "}
            {detail.specs?.map((s) => `${s.label}: ${s.value}`).join("; ") ||
              "none"}
          </p>
          <p>
            Related: {detail.related.map((r) => r.name).join(", ") || "none"}
          </p>
          {settings?.whatsappNumber && (
            <a
              className="text-table underline"
              href={buildWhatsAppLink(
                settings.whatsappNumber,
                productOrderMessage({
                  name: detail.name,
                  slug: detail.slug,
                  unitPrice: getEffectivePrice(detail),
                  options: detail.options?.map((o) => ({
                    name: o.name,
                    value: o.values[0],
                  })),
                }),
              )}
            >
              Sample WhatsApp order link
            </a>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">siteSettings</h2>
        <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs">
          {JSON.stringify(
            {
              ...settings,
              aboutText: settings?.aboutText ? "[portable text]" : null,
            },
            null,
            2,
          )}
        </pre>
      </section>
    </main>
  );
}
