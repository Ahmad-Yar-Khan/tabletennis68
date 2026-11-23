import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeroBanner } from "@/components/home/HeroBanner";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ShopByBrand } from "@/components/home/ShopByBrand";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { StoreLocationStrip } from "@/components/home/StoreLocationStrip";
import { WhyBuyFromUs } from "@/components/home/WhyBuyFromUs";
import { getSiteContent } from "@/lib/sanity/content";

const MAX_NEW = 8;
const MAX_FEATURED = 8;

/** Home page. All data is fetched once at build time and passed down; empty sections hide themselves. */
export default async function Home() {
  const { banners, products, categories, brands, settings } =
    await getSiteContent();

  const newArrivals = products
    .filter((p) => p.isNew)
    .sort((a, b) => b._createdAt.localeCompare(a._createdAt))
    .slice(0, MAX_NEW);
  // Already in the owner's sort order from the query.
  const featured = products.filter((p) => p.featured).slice(0, MAX_FEATURED);
  // Skip empty categories/brands so no tile leads to an empty page.
  const shopCategories = categories.filter((c) => c.productCount > 0);
  const shopBrands = brands.filter((b) => b.productCount > 0);

  return (
    <>
      <HeroBanner
        banners={banners}
        whatsappNumber={settings?.whatsappNumber ?? null}
        shopName={settings?.shopName || "tabletennis68"}
      />
      <ShopByCategory categories={shopCategories} />
      <NewArrivals products={newArrivals} />
      <FeaturedProducts products={featured} />
      <ShopByBrand brands={shopBrands} />
      <WhyBuyFromUs />
      <StoreLocationStrip settings={settings} />
    </>
  );
}
