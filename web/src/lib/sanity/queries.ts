import { defineQuery } from "next-sanity";

/*
 * GROQ queries with explicit projections. Field names match studio/schemaTypes exactly.
 * Each projection has a matching type in src/lib/types.ts — keep them in sync.
 * Images are optional everywhere (demo products have none): they project to null.
 */

// --- Reusable fragments ------------------------------------------------------

/**
 * An image field → SanityImage (null when not set).
 * No `lqip` blur placeholder: nothing renders it, and as base64 it added ~1 KB per image to every page.
 */
const imageFields = /* groq */ `
  alt,
  crop,
  hotspot,
  "asset": asset->{
    _id,
    metadata { dimensions { width, height, aspectRatio } }
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
  "image": images[0]{ ${imageFields} },
  "hoverImage": images[1]{ ${imageFields} }
`;

// --- Projections -------------------------------------------------------------

/** Product detail fields (on top of the card fields). `categoryId` is used to find related products. */
const productDetailFields = /* groq */ `
  "categoryId": category._ref,
  "images": images[defined(asset)]{ _key, ${imageFields} },
  description,
  "options": options[]{ _key, name, "values": coalesce(values, []) },
  "specs": specs[]{ _key, label, value }
`;

/** Categories by the owner's position, then name. → Category[] */
const categoriesProjection = /* groq */ `
  *[_type == "category" && defined(slug.current)]
    | order(coalesce(order, 999999) asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    "image": image{ ${imageFields} },
    "productCount": count(*[${productFilter} && references(^._id)])
  }
`;

/** Brands A–Z. → Brand[] */
const brandsProjection = /* groq */ `
  *[_type == "brand" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "logo": logo{ ${imageFields} },
    "productCount": count(*[${productFilter} && references(^._id)])
  }
`;

/** Active home banners by position. "Show on website" unset counts as on. → Banner[] */
const activeBannersProjection = /* groq */ `
  *[_type == "banner" && active != false] | order(coalesce(order, 999999) asc, _createdAt asc) {
    _id,
    heading,
    subheading,
    buttonText,
    buttonLink,
    "image": image{ ${imageFields} }
  }
`;

/** The single Site settings document (_id "siteSettings"). → SiteSettings | null */
const siteSettingsProjection = /* groq */ `
  *[_id == "siteSettings"][0] {
    shopName,
    whatsappNumber,
    phone,
    email,
    instagramUrl,
    facebookUrl,
    announcementText,
    deliveryInfo,
    aboutText
  }
`;

// --- The one query the site is built from ------------------------------------

/**
 * Everything the website shows, in one request (see src/lib/sanity/content.ts).
 * Products are in the owner's order and carry both card and detail fields.
 * → SiteContentResult (src/lib/sanity/content.ts)
 */
export const siteContentQuery = defineQuery(`{
  "products": *[${productFilter}] | ${productOrder} {
    ${productCardFields},
    ${productDetailFields}
  },
  "categories": ${categoriesProjection},
  "brands": ${brandsProjection},
  "banners": ${activeBannersProjection},
  "settings": ${siteSettingsProjection}
}`);
