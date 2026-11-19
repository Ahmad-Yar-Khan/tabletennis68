import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingHero } from "@/components/shop/ListingHero";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  allProductsQuery,
  brandsQuery,
  categoriesQuery,
  categorySlugsQuery,
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
  const slugs = await sanityFetch<string[]>(categorySlugsQuery);
  return slugs.map((slug) => ({ slug }));
}

async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await sanityFetch<Category[]>(categoriesQuery);
  return categories.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description ||
      `Shop ${category.name.toLowerCase()} in Pakistan. Filter by brand and price, then order on WhatsApp.`,
    alternates: { canonical: `/category/${slug}/` },
  };
}

/** One category: the shop browser with the category locked. */
export default async function CategoryPage({
  params,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const [products, categories, brands, settings] = await Promise.all([
    sanityFetch<ProductListItem[]>(allProductsQuery),
    sanityFetch<Category[]>(categoriesQuery),
    sanityFetch<Brand[]>(brandsQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const inCategory = products.filter((p) => p.category?.slug === slug);

  return (
    <>
      <ListingHero
        title={category.name}
        description={category.description}
        breadcrumbs={[{ href: "/shop/", label: "Shop" }]}
      />
      <Container className="py-6 sm:py-8 lg:py-10">
        <ProductBrowser
          products={inCategory}
          categories={categories}
          brands={brands}
          locked={{ type: "category", slug }}
          whatsappNumber={settings?.whatsappNumber ?? null}
          searchPlaceholder={`Search ${category.name.toLowerCase()}`}
        />
      </Container>
    </>
  );
}
