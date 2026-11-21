import { hasImage, imageUrl } from "@/lib/sanity/image";
import type { ProductDetail } from "@/lib/types";
import { absoluteUrl, getEffectivePrice, productPath } from "@/lib/utils";
import type { Crumb } from "./ProductBreadcrumbs";

/** schema.org Product (with an Offer in PKR) and BreadcrumbList, for Google rich results. */
export function ProductJsonLd({
  product,
  crumbs,
  shopName,
}: {
  product: ProductDetail;
  crumbs: Crumb[];
  shopName: string;
}) {
  const url = absoluteUrl(productPath(product.slug));
  const images = (product.images ?? [])
    .filter(hasImage)
    .map((img) => imageUrl(img, 1200))
    .filter((src): src is string => Boolean(src));

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        url,
        sku: product._id,
        ...(images.length > 0 && { image: images }),
        ...(product.shortDescription && {
          description: product.shortDescription,
        }),
        ...(product.brand?.name && {
          brand: { "@type": "Brand", name: product.brand.name },
        }),
        ...(product.category?.name && { category: product.category.name }),
        offers: {
          "@type": "Offer",
          url,
          price: getEffectivePrice(product),
          priceCurrency: "PKR",
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: shopName },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          ...crumbs.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: crumb.label,
            item: absoluteUrl(crumb.href),
          })),
          {
            "@type": "ListItem",
            position: crumbs.length + 1,
            name: product.name,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so product text can never close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
