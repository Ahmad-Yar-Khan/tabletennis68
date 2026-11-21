import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { EnquiryProvider } from "@/components/enquiry/EnquiryProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { sanityFetch } from "@/lib/sanity/client";
import {
  brandsQuery,
  categoriesQuery,
  siteSettingsQuery,
} from "@/lib/sanity/queries";
import type { Brand, Category, SiteSettings } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

// Body and UI text: Inter 400 (regular) and 500 (medium) only.
const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Display headings: Barlow Condensed 700/800 italic.
const heading = Barlow_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["italic"],
  display: "swap",
});

const description =
  "Table tennis rackets, blades, rubbers, balls and accessories in Pakistan. Browse the range and order on WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "tabletennis68 | Table tennis equipment in Pakistan",
    template: "%s | tabletennis68",
  },
  description,
  applicationName: "tabletennis68",
  openGraph: {
    type: "website",
    siteName: "tabletennis68",
    locale: "en_PK",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetched once at build time; every page gets the same header/footer data.
  const [settings, categories, brands] = await Promise.all([
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
    sanityFetch<Category[]>(categoriesQuery),
    sanityFetch<Brand[]>(brandsQuery),
  ]);
  const shopName = settings?.shopName || "tabletennis68";

  return (
    <html
      lang="en"
      className={`${body.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <MotionProvider>
          <EnquiryProvider whatsappNumber={settings?.whatsappNumber ?? null}>
            <a
              href="#main"
              className="sr-only z-50 rounded-pill bg-ink px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
            >
              Skip to content
            </a>
            <AnnouncementBar text={settings?.announcementText} />
            <Header categories={categories} brands={brands} settings={settings} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer categories={categories} settings={settings} />
            <FloatingWhatsAppButton
              whatsappNumber={settings?.whatsappNumber ?? null}
              shopName={shopName}
            />
          </EnquiryProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
