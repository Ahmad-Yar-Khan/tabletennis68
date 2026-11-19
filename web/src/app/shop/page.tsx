import type { Metadata } from "next";
import { ListingHero } from "@/components/shop/ListingHero";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  allProductsQuery,
  brandsQuery,
  categoriesQuery,
  siteSettingsQuery,
} from "@/lib/sanity/queries";
import type {
  Brand,
  Category,
  ProductListItem,
  SiteSettings,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop all table tennis equipment",
  description:
    "Browse rackets, blades, rubbers, balls, shoes and more. Filter by category, brand and price, then order on WhatsApp.",
  alternates: { canonical: "/shop/" },
};

/** All products with client-side search, filters and sort (data fetched at build time). */
export default async function ShopPage() {
  const [products, categories, brands, settings] = await Promise.all([
    sanityFetch<ProductListItem[]>(allProductsQuery),
    sanityFetch<Category[]>(categoriesQuery),
    sanityFetch<Brand[]>(brandsQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  return (
    <>
      <ListingHero
        eyebrow="The full range"
        title="Shop"
        description="Rackets, blades, rubbers and everything else for your game. Order any item on WhatsApp."
      />
      <Container className="py-6 sm:py-8 lg:py-10">
        <ProductBrowser
          products={products}
          categories={categories}
          brands={brands}
          whatsappNumber={settings?.whatsappNumber ?? null}
        />
      </Container>
    </>
  );
}
