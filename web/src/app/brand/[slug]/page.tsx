import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandLogoBadge } from "@/components/shop/BrandLogoBadge";
import { ListingHero } from "@/components/shop/ListingHero";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { Container } from "@/components/ui/Container";
import { productCountLabel } from "@/lib/shop";
import { getBrands, getSiteContent } from "@/lib/sanity/content";
import type { Brand } from "@/lib/types";

export const dynamicParams = false;

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((b) => ({ slug: b.slug }));
}

async function getBrand(slug: string): Promise<Brand | undefined> {
  const brands = await getBrands();
  return brands.find((b) => b.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/brand/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return {};
  const title = `${brand.name} table tennis equipment in Pakistan`;
  const description = `Shop ${productCountLabel(brand.productCount)} from ${brand.name} in Pakistan, with prices in Rs. Filter by category and price, then order on WhatsApp.`;
  return {
    title,
    description,
    alternates: { canonical: `/brand/${slug}/` },
    openGraph: { title, description, url: `/brand/${slug}/` },
  };
}

/** One brand: the shop browser with the brand locked. */
export default async function BrandPage({
  params,
}: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const { products, categories, brands, settings } = await getSiteContent();
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const byBrand = products.filter((p) => p.brand?.slug === slug);

  return (
    <>
      <ListingHero
        eyebrow="Brand"
        title={brand.name}
        description={`Every ${brand.name} product we stock. Pick what you need and order on WhatsApp.`}
        meta={productCountLabel(byBrand.length)}
        breadcrumbs={[{ href: "/shop/", label: "Shop" }]}
        aside={<BrandLogoBadge brand={brand} />}
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
