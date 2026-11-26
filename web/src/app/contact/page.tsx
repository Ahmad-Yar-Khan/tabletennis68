import { Truck } from "lucide-react";
import type { Metadata } from "next";
import { ContactActions } from "@/components/contact/ContactActions";
import { FaqSection } from "@/components/contact/FaqSection";
import { InfoCard } from "@/components/contact/InfoCard";
import { ListingHero } from "@/components/shop/ListingHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { faqs } from "@/lib/faq";
import { getSiteSettings } from "@/lib/sanity/content";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "WhatsApp, call or email tabletennis68. Delivery across Pakistan and answers to common questions.",
  alternates: { canonical: "/contact/" },
};

/** Contact page: quick contact buttons, delivery info and FAQs. */
export default async function ContactPage() {
  const settings = await getSiteSettings();
  const shopName = settings?.shopName || "tabletennis68";
  const delivery = settings?.deliveryInfo?.trim();
  const whatsappNumber = settings?.whatsappNumber ?? null;

  return (
    <>
      <ListingHero
        eyebrow="We're here to help"
        title="Contact us"
        description="Questions about a blade, rubber thickness or your order? Message us on WhatsApp for the quickest reply."
      />

      <Container className="py-10 sm:py-14">
        <ContactActions
          whatsappNumber={whatsappNumber}
          phone={settings?.phone ?? null}
          email={settings?.email ?? null}
          shopName={shopName}
        />

        {delivery && (
          <div className="mt-6 sm:mt-8">
            <InfoCard icon={Truck} title="Delivery">
              <p className="leading-relaxed whitespace-pre-line text-muted">
                {delivery}
              </p>
            </InfoCard>
          </div>
        )}

        <div className="mx-auto mt-14 max-w-3xl sm:mt-20">
          <FaqSection items={faqs} />

          {whatsappNumber && (
            <div className="mt-8 flex flex-col items-start gap-4 rounded-card bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="font-display text-2xl font-extrabold uppercase italic">
                  Still have a question?
                </p>
                <p className="text-muted-light">
                  Send us a message and we&apos;ll get back to you.
                </p>
              </div>
              <Button
                href={buildWhatsAppLink(
                  whatsappNumber,
                  greetingMessage(shopName),
                )}
                variant="whatsapp"
                size="lg"
              >
                <WhatsAppIcon />
                Ask on WhatsApp
              </Button>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
