import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingHero } from "@/components/shop/ListingHero";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { Container } from "@/components/ui/Container";
import { productCountLabel } from "@/lib/shop";
import { getCategories, getSiteContent } from "@/lib/sanity/content";
import type { Category } from "@/lib/types";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const title = `Table tennis ${category.name.toLowerCase()} in Pakistan`;
  const description =
    category.description ||
    `Shop ${productCountLabel(category.productCount)} in ${category.name.toLowerCase()}, with prices in Rs. Filter by brand and price, then order on WhatsApp.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}/` },
    openGraph: { title, description, url: `/category/${slug}/` },
  };
}

/** One category: the shop browser with the category locked. */
export default async function CategoryPage({
  params,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const { products, categories, brands, settings } = await getSiteContent();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const inCategory = products.filter((p) => p.category?.slug === slug);

  return (
    <>
      <ListingHero
        title={category.name}
        description={category.description}
        meta={productCountLabel(inCategory.length)}
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
