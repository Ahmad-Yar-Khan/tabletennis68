import { defineQuery } from "next-sanity";

/*
 * GROQ queries with explicit projections. Field names match studio/schemaTypes exactly.
 * Each projection has a matching type in src/lib/types.ts — keep them in sync.
 * Images are optional everywhere (demo products have none): they project to null.
 */

// --- Reusable fragments ------------------------------------------------------

/** An image field → SanityImage (null when not set). */
const imageFields = /* groq */ `
  alt,
  crop,
  hotspot,
  "asset": asset->{
    _id,
    metadata { lqip, dimensions { width, height, aspectRatio } }
  }
`;

/** Products with a web address; drafts are excluded by the client's "published" perspective. */
const productFilter = /* groq */ `_type == "product" && defined(slug.current)`;

/** Owner's sort order first (empty = last), then newest first. */
const productOrder = /* groq */ `order(coalesce(sortOrder, 999999) asc, _createdAt desc)`;

/** → ProductListItem */
const productCardFields = /* groq */ `
  _id,
  _createdAt,
  name,
  "slug": slug.current,
  shortDescription,
  price,
  salePrice,
  "inStock": coalesce(inStock, true),
  "featured": coalesce(featured, false),
  "isNew": coalesce(isNew, false),
  sortOrder,
  "category": category->{ name, "slug": slug.current },
  "brand": brand->{ name, "slug": slug.current },
  "image": images[0]{ ${imageFields} }
`;

// --- Products ----------------------------------------------------------------

/** All products for listings and client-side filtering. → ProductListItem[] */
export const allProductsQuery = defineQuery(`
  *[${productFilter}] | ${productOrder} { ${productCardFields} }
`);

/** One product with full detail + up to 8 related products from the same category. → ProductDetail | null */
export const productBySlugQuery = defineQuery(`
  *[${productFilter} && slug.current == $slug][0] {
    ${productCardFields},
    "images": images[defined(asset)]{ _key, ${imageFields} },
    description,
    "options": options[]{ _key, name, "values": coalesce(values, []) },
    "specs": specs[]{ _key, label, value },
    "related": *[${productFilter} && category._ref == ^.category._ref && _id != ^._id]
      | ${productOrder} [0...8] { ${productCardFields} }
  }
`);

// --- Slugs for generateStaticParams -----------------------------------------

/** → string[] */
export const productSlugsQuery = defineQuery(
  `*[${productFilter}].slug.current`,
);

/** → string[] */
export const categorySlugsQuery = defineQuery(
  `*[_type == "category" && defined(slug.current)].slug.current`,
);

/** → string[] */
export const brandSlugsQuery = defineQuery(
  `*[_type == "brand" && defined(slug.current)].slug.current`,
);

// --- Categories, brands, banners, settings -----------------------------------

/** Categories by the owner's position, then name. → Category[] */
export const categoriesQuery = defineQuery(`
  *[_type == "category" && defined(slug.current)]
    | order(coalesce(order, 999999) asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    "image": image{ ${imageFields} },
    "productCount": count(*[${productFilter} && references(^._id)])
  }
`);

/** Brands A–Z. → Brand[] */
export const brandsQuery = defineQuery(`
  *[_type == "brand" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "logo": logo{ ${imageFields} },
    "productCount": count(*[${productFilter} && references(^._id)])
  }
`);

/** Active home banners by position. "Show on website" unset counts as on. → Banner[] */
export const activeBannersQuery = defineQuery(`
  *[_type == "banner" && active != false] | order(coalesce(order, 999999) asc, _createdAt asc) {
    _id,
    heading,
    subheading,
    buttonText,
    buttonLink,
    "image": image{ ${imageFields} }
  }
`);

/** The single Site settings document (_id "siteSettings"). → SiteSettings | null */
export const siteSettingsQuery = defineQuery(`
  *[_id == "siteSettings"][0] {
    shopName,
    whatsappNumber,
    phone,
    email,
    address,
    mapsUrl,
    mapEmbedUrl,
    openingHours,
    instagramUrl,
    facebookUrl,
    announcementText,
    deliveryInfo,
    aboutText
  }
`);
