import { Clock, MapPin, Navigation, Truck } from "lucide-react";
import type { Metadata } from "next";
import { ContactActions } from "@/components/contact/ContactActions";
import { FaqSection } from "@/components/contact/FaqSection";
import { InfoCard } from "@/components/contact/InfoCard";
import { LazyMapEmbed } from "@/components/contact/LazyMapEmbed";
import { OpeningHours } from "@/components/contact/OpeningHours";
import { ListingHero } from "@/components/shop/ListingHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { faqs } from "@/lib/faq";
import { sanityFetch } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "WhatsApp, call or visit tabletennis68. Shop address, opening hours, delivery across Pakistan and answers to common questions.",
  alternates: { canonical: "/contact/" },
};

/** Contact page: quick contact buttons, address + map, hours, delivery info and FAQs. */
export default async function ContactPage() {
  const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery);
  const shopName = settings?.shopName || "tabletennis68";
  const address = settings?.address?.trim();
  const hours = settings?.openingHours?.trim();
  const delivery = settings?.deliveryInfo?.trim();
  const mapsUrl = settings?.mapsUrl;
  const mapEmbedUrl = settings?.mapEmbedUrl;
  const whatsappNumber = settings?.whatsappNumber ?? null;
  const hasCards = Boolean(address || mapsUrl || hours || delivery);

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

        {(hasCards || mapEmbedUrl) && (
          <div
            className={cn(
              "mt-6 grid gap-4 sm:mt-8 sm:gap-6",
              mapEmbedUrl
                ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                : "md:grid-cols-2",
            )}
          >
            {hasCards && (
              <div
                className={cn(
                  "grid content-start gap-4 sm:gap-6",
                  !mapEmbedUrl && "contents",
                )}
              >
                {(address || mapsUrl) && (
                  <InfoCard icon={MapPin} title="Visit the shop">
                    {address && (
                      <address className="leading-relaxed whitespace-pre-line not-italic">
                        {address}
                      </address>
                    )}
                    {mapsUrl && (
                      <Button
                        href={mapsUrl}
                        size="lg"
                        fullWidth
                        className={cn("sm:w-auto", address && "mt-4")}
                      >
                        <Navigation aria-hidden />
                        Get directions
                      </Button>
                    )}
                  </InfoCard>
                )}

                {hours && (
                  <InfoCard icon={Clock} title="Opening hours">
                    <OpeningHours text={hours} />
                  </InfoCard>
                )}

                {delivery && (
                  <InfoCard icon={Truck} title="Delivery">
                    <p className="leading-relaxed whitespace-pre-line text-muted">
                      {delivery}
                    </p>
                  </InfoCard>
                )}
              </div>
            )}

            {mapEmbedUrl && (
              <LazyMapEmbed
                src={mapEmbedUrl}
                title={`Map showing the location of ${shopName}`}
                className="aspect-[4/3] sm:aspect-video lg:aspect-auto lg:min-h-[28rem]"
              />
            )}
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
