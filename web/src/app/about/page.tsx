import { ArrowRight, Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { WhyBuyFromUs } from "@/components/home/WhyBuyFromUs";
import { ListingHero } from "@/components/shop/ListingHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { RichText } from "@/components/ui/RichText";
import { sanityFetch } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/types";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About us",
  description:
    "The story behind tabletennis68: genuine table tennis equipment for players across Pakistan, chosen by people who play.",
  alternates: { canonical: "/about/" },
};

/** About page: the owner's story (Site settings → About the shop), a contact card and "Why buy from us". */
export default async function AboutPage() {
  const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery);
  const shopName = settings?.shopName || "tabletennis68";
  const about = settings?.aboutText ?? [];
  const address = settings?.address?.trim();
  const hours = settings?.openingHours?.trim();
  const whatsappNumber = settings?.whatsappNumber;

  return (
    <>
      <ListingHero
        eyebrow="Our story"
        title={`About ${shopName}`}
        description="Table tennis gear for players across Pakistan, picked by people who play."
      />

      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        {/* First paragraph reads as a larger lead-in. */}
        <article className="max-w-prose-narrow text-lg leading-relaxed text-ink/85 [&>p:first-child]:font-medium [&>p:first-child]:text-ink sm:[&>p:first-child]:text-xl">
          {about.length > 0 ? (
            <RichText value={about} />
          ) : (
            <>
              <p className="mb-4">
                We are a table tennis shop for players of every level, from
                first-time club members to tournament regulars.
              </p>
              <p>
                Browse the range online and order on WhatsApp. If you are not
                sure what to choose, just ask: we are happy to help.
              </p>
            </>
          )}
        </article>

        <aside aria-label="Visit or message us" className="lg:pt-1">
          <div className="relative overflow-hidden rounded-card bg-ink p-6 text-white lg:sticky lg:top-24">
            {/* Faint table line */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/[0.06]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-red/25 blur-3xl"
            />
            <div className="relative">
              <p className="font-display text-lg font-bold tracking-wider text-coral uppercase italic">
                Come and play
              </p>
              <h2 className="mt-1 text-3xl uppercase">Visit or message us</h2>

              {(address || hours) && (
                <ul className="mt-5 space-y-4 text-sm">
                  {address && (
                    <li className="flex gap-3">
                      <MapPin
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-coral"
                      />
                      <address className="whitespace-pre-line not-italic">
                        {address}
                      </address>
                    </li>
                  )}
                  {hours && (
                    <li className="flex gap-3">
                      <Clock
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-coral"
                      />
                      <span className="whitespace-pre-line">{hours}</span>
                    </li>
                  )}
                </ul>
              )}

              <div className="mt-6 flex flex-col gap-3">
                {whatsappNumber && (
                  <Button
                    href={buildWhatsAppLink(
                      whatsappNumber,
                      greetingMessage(shopName),
                    )}
                    variant="whatsapp"
                    fullWidth
                  >
                    <WhatsAppIcon />
                    Chat on WhatsApp
                  </Button>
                )}
                <Button href="/shop/" fullWidth>
                  Shop all products
                  <ArrowRight aria-hidden />
                </Button>
              </div>
              <Link
                href="/contact/"
                className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-light transition-colors hover:text-white"
              >
                All contact details &amp; FAQs
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </aside>
      </Container>

      <WhyBuyFromUs />
    </>
  );
}
