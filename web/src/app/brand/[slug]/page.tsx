import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingHero } from "@/components/shop/ListingHero";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  allProductsQuery,
  brandSlugsQuery,
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

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(brandSlugsQuery);
  return slugs.map((slug) => ({ slug }));
}

async function getBrand(slug: string): Promise<Brand | undefined> {
  const brands = await sanityFetch<Brand[]>(brandsQuery);
  return brands.find((b) => b.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/brand/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} table tennis equipment`,
    description: `Shop ${brand.name} table tennis equipment in Pakistan. Filter by category and price, then order on WhatsApp.`,
    alternates: { canonical: `/brand/${slug}/` },
  };
}

/** One brand: the shop browser with the brand locked. */
export default async function BrandPage({
  params,
}: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const [products, categories, brands, settings] = await Promise.all([
    sanityFetch<ProductListItem[]>(allProductsQuery),
    sanityFetch<Category[]>(categoriesQuery),
    sanityFetch<Brand[]>(brandsQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ]);
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const byBrand = products.filter((p) => p.brand?.slug === slug);

  return (
    <>
      <ListingHero
        eyebrow="Brand"
        title={brand.name}
        breadcrumbs={[{ href: "/shop/", label: "Shop" }]}
      />
      <Container className="py-6 sm:py-8 lg:py-10">
        <ProductBrowser
          products={byBrand}
          categories={categories}
          brands={brands}
          locked={{ type: "brand", slug }}
          whatsappNumber={settings?.whatsappNumber ?? null}
          searchPlaceholder={`Search ${brand.name}`}
        />
      </Container>
    </>
  );
}
