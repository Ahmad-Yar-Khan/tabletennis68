import type { Metadata } from "next";
import { EnquiryPageContent } from "@/components/enquiry/EnquiryPageContent";
import { Container } from "@/components/ui/Container";
import { getSiteSettings } from "@/lib/sanity/content";

export const metadata: Metadata = {
  title: "Your order list",
  description:
    "Your saved products. Send the whole list to us on WhatsApp in one message.",
  alternates: { canonical: "/enquiry/" },
  // Personal, per-visitor page: nothing to index.
  robots: { index: false, follow: true },
};

/** Enquiry list page. The list itself is read from localStorage in the browser. */
export default async function EnquiryPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="flex items-center gap-3 text-4xl uppercase sm:text-5xl">
        <span
          aria-hidden
          className="inline-block h-[0.8em] w-1.5 shrink-0 -skew-x-12 rounded-[1px] bg-red"
        />
        Your order list
      </h1>
      <p className="mt-2 mb-6 max-w-prose-narrow text-muted sm:mb-8">
        Check your items, then send the list to us on WhatsApp. We&apos;ll reply
        with availability, the final price and delivery charges.
      </p>
      <EnquiryPageContent whatsappNumber={settings?.whatsappNumber ?? null} />
    </Container>
  );
}
