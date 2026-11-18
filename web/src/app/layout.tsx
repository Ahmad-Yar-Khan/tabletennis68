import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { sanityFetch } from "@/lib/sanity/client";
import { categoriesQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import type { Category, SiteSettings } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const heading = Barlow_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
  const [settings, categories] = await Promise.all([
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
    sanityFetch<Category[]>(categoriesQuery),
  ]);
  const shopName = settings?.shopName || "tabletennis68";

  return (
    <html
      lang="en"
      className={`${body.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <MotionProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-pill bg-ink px-4 py-2 text-surface focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Skip to content
          </a>
          <AnnouncementBar text={settings?.announcementText} />
          <Header categories={categories} settings={settings} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer categories={categories} settings={settings} />
          <FloatingWhatsAppButton
            whatsappNumber={settings?.whatsappNumber ?? null}
            shopName={shopName}
          />
        </MotionProvider>
      </body>
    </html>
  );
}
