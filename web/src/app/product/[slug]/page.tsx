import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeliveryInfo } from "@/components/product/DeliveryInfo";
import {
  ProductBreadcrumbs,
  type Crumb,
} from "@/components/product/ProductBreadcrumbs";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import {
  getProduct,
  getProducts,
  getSiteSettings,
} from "@/lib/sanity/content";
import { hasImage, urlForImage } from "@/lib/sanity/image";
import type { ProductDetail } from "@/lib/types";
import {
  formatPrice,
  getDiscountPercent,
  getEffectivePrice,
  productPath,
} from "@/lib/utils";

export const dynamicParams = false;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

function metaDescription(product: ProductDetail): string {
  return (
    product.shortDescription ||
    `${product.name} for ${formatPrice(getEffectivePrice(product))}. Order on WhatsApp with delivery across Pakistan.`
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const description = metaDescription(product);
  const path = productPath(slug);
  const main = product.images?.find(hasImage) ?? null;
  // 1200×630 crop centred on the owner's hotspot: the size WhatsApp/Facebook previews expect.
  // Plain JPEG (not auto=format): WhatsApp's link preview does not reliably show WebP/AVIF.
  const ogImage = hasImage(main)
    ? urlForImage(main)
        .width(1200)
        .height(630)
        .fit("crop")
        .format("jpg")
        .quality(80)
        .url()
    : null;
  const images = ogImage
    ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: main?.alt || product.name,
        },
      ]
    : undefined;

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: { title: product.name, description, url: path, images },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

/** Product page: gallery, price, options, WhatsApp ordering, specs, description, related products. */
export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProduct(slug),
    getSiteSettings(),
  ]);
  if (!product) notFound();

  const { name, brand, category, price, salePrice, inStock, isNew } = product;
  const images = (product.images ?? []).filter(hasImage);
  const options = (product.options ?? []).filter(
    (o) => o.name && o.values.length > 0,
  );
  const discount = getDiscountPercent(product);

  const crumbs: Crumb[] = [
    { href: "/", label: "Home" },
    { href: "/shop/", label: "Shop" },
    ...(category?.slug
      ? [{ href: `/category/${category.slug}/`, label: category.name }]
      : []),
  ];

  return (
    <>
      <ProductJsonLd
        product={product}
        crumbs={crumbs}
        shopName={settings?.shopName || "tabletennis68"}
      />

      <Container className="pt-4 pb-10 sm:pt-6 lg:pb-16">
        <ProductBreadcrumbs crumbs={crumbs} current={name} />

        <div className="mt-4 grid gap-6 sm:mt-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={images} productName={name} />
          </div>

          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-3">
              {(isNew || discount > 0 || !inStock) && (
                <div className="flex flex-wrap gap-2">
                  {!inStock && <Badge variant="out-of-stock" />}
                  {discount > 0 && <Badge variant="sale" percent={discount} />}
                  {isNew && <Badge variant="new" />}
                </div>
              )}
              {brand?.name &&
                (brand.slug ? (
                  <Link
                    href={`/brand/${brand.slug}/`}
                    className="flex w-fit items-center gap-2 text-sm font-medium tracking-widest text-crimson uppercase transition-colors hover:text-ink"
                  >
                    <span aria-hidden className="h-0.5 w-5 bg-red" />
                    {brand.name}
                  </Link>
                ) : (
                  <p className="text-sm font-medium tracking-widest text-crimson uppercase">
                    {brand.name}
                  </p>
                ))}
              <h1 className="text-3xl uppercase sm:text-5xl">{name}</h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <ProductPrice price={price} salePrice={salePrice} size="lg" />
                {discount > 0 && (
                  <span className="text-sm font-medium text-crimson tabular-nums">
                    You save {formatPrice(price - getEffectivePrice(product))}
                  </span>
                )}
              </div>

              {inStock ? (
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span
                    aria-hidden
                    className="size-2 rounded-full bg-whatsapp ring-4 ring-whatsapp/20"
                  />
                  In stock
                </p>
              ) : (
                <p className="flex items-center gap-2 text-sm font-medium text-muted">
                  <span aria-hidden className="size-2 rounded-full bg-muted" />
                  Out of stock right now
                </p>
              )}

              {product.shortDescription && (
                <p className="max-w-prose-narrow leading-relaxed text-muted sm:text-lg">
                  {product.shortDescription}
                </p>
              )}
            </div>

            <div className="h-px bg-line" />

            <ProductPurchase
              product={{
                _id: product._id,
                name,
                slug,
                price,
                salePrice,
                inStock,
                options,
                image: images[0] ?? null,
              }}
              whatsappNumber={settings?.whatsappNumber ?? null}
            />

            <DeliveryInfo text={settings?.deliveryInfo ?? null} />
            <ProductSpecs specs={product.specs ?? []} />
            <ProductDescription value={product.description ?? []} />
          </div>
        </div>
      </Container>

      <div className="border-t border-line">
        <RelatedProducts products={product.related} category={category} />
      </div>
    </>
  );
}
