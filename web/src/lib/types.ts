import type { PortableTextBlock } from "next-sanity";

/*
 * Types matching the GROQ projections in src/lib/sanity/queries.ts exactly.
 * GROQ returns `null` (not undefined) for missing fields, so optional data is `T | null`.
 */

// --- Images ------------------------------------------------------------------

export type SanityImageCrop = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type SanityImageHotspot = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Projection of `imageFields`. Any image may be missing — always handle null. */
export type SanityImage = {
  alt: string | null;
  crop: SanityImageCrop | null;
  hotspot: SanityImageHotspot | null;
  asset: {
    _id: string;
    metadata: {
      lqip: string | null;
      dimensions: { width: number; height: number; aspectRatio: number } | null;
    } | null;
  } | null;
};

// --- Shared references -------------------------------------------------------

export type CategoryRef = { name: string; slug: string | null };
export type BrandRef = { name: string; slug: string | null };

// --- Products ----------------------------------------------------------------

/** One item from `allProductsQuery` (also used for related products). */
export type ProductListItem = {
  _id: string;
  _createdAt: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  sortOrder: number | null;
  category: CategoryRef | null;
  brand: BrandRef | null;
  /** Main (first) photo, or null when the product has no photos yet. */
  image: SanityImage | null;
  /** Second photo, shown when hovering a product card. Null when there is only one. */
  hoverImage: SanityImage | null;
};

export type ProductOption = { _key: string; name: string; values: string[] };

export type ProductSpec = { _key: string; label: string; value: string };

/** Result of `productBySlugQuery`. */
export type ProductDetail = ProductListItem & {
  /** Only photos with an uploaded file; may be empty. */
  images: (SanityImage & { _key: string })[] | null;
  description: PortableTextBlock[] | null;
  options: ProductOption[] | null;
  specs: ProductSpec[] | null;
  related: ProductListItem[];
};

// --- Taxonomy, banners, settings ---------------------------------------------

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string | null;
  image: SanityImage | null;
  productCount: number;
};

export type Brand = {
  _id: string;
  name: string;
  slug: string;
  logo: SanityImage | null;
  productCount: number;
};

export type Banner = {
  _id: string;
  heading: string | null;
  subheading: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  image: SanityImage | null;
};

export type SiteSettings = {
  shopName: string | null;
  whatsappNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  mapsUrl: string | null;
  mapEmbedUrl: string | null;
  openingHours: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  announcementText: string | null;
  deliveryInfo: string | null;
  aboutText: PortableTextBlock[] | null;
};

// --- Client-side (not from Sanity) -------------------------------------------

/** An option the customer picked, e.g. { name: "Handle", value: "FL" }. */
export type SelectedOption = { name: string; value: string };

/** One line in the enquiry list ("WhatsApp cart"), stored in localStorage. */
export type EnquiryItem = {
  productId: string;
  slug: string;
  name: string;
  /** Effective unit price at the time it was added (sale price if any). */
  unitPrice: number;
  options: SelectedOption[];
  quantity: number;
};
