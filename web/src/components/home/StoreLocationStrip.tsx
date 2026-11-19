import { Clock, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import type { SiteSettings } from "@/lib/types";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

/**
 * Dark strip above the footer: shop address, opening hours, and buttons for
 * directions (Google Maps link from Site settings) and WhatsApp. Hidden when none of these are set.
 */
export function StoreLocationStrip({
  settings,
}: {
  settings: SiteSettings | null;
}) {
  const address = settings?.address?.trim();
  const hours = settings?.openingHours?.trim();
  const mapsUrl = settings?.mapsUrl;
  const whatsappNumber = settings?.whatsappNumber;
  if (!address && !hours && !mapsUrl && !whatsappNumber) return null;

  return (
    <section
      aria-labelledby="visit-the-shop"
      className="relative -mb-6 overflow-hidden bg-ink pb-6 text-white [--slant:1.5rem] slant-top sm:-mb-10 sm:pb-10 sm:[--slant:2.5rem]"
    >
      {/* Faint table line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/10"
      />
      <Container className="relative grid gap-8 pt-16 pb-12 sm:pt-20 sm:pb-16 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center lg:gap-10">
        <div>
          <p className="font-display text-lg font-bold tracking-wider text-coral uppercase italic">
            Come and play
          </p>
          <h2
            id="visit-the-shop"
            className="mt-1 text-4xl uppercase sm:text-5xl"
          >
            Visit the shop
          </h2>
        </div>

        {address && (
          <div className="flex gap-3">
            <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-coral" />
            <div>
              <h3 className="font-sans text-sm font-medium tracking-wider text-muted-light not-italic uppercase">
                Address
              </h3>
              <address className="mt-1 not-italic whitespace-pre-line">
                {address}
              </address>
            </div>
          </div>
        )}

        {hours && (
          <div className="flex gap-3">
            <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-coral" />
            <div>
              <h3 className="font-sans text-sm font-medium tracking-wider text-muted-light not-italic uppercase">
                Opening hours
              </h3>
              <p className="mt-1 whitespace-pre-line">{hours}</p>
            </div>
          </div>
        )}

        {(mapsUrl || whatsappNumber) && (
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            {mapsUrl && (
              <Button href={mapsUrl} size="lg">
                <Navigation aria-hidden />
                Get directions
              </Button>
            )}
            {whatsappNumber && (
              <Button
                href={buildWhatsAppLink(
                  whatsappNumber,
                  greetingMessage(settings?.shopName || undefined),
                )}
                size="lg"
                variant="whatsapp"
              >
                <WhatsAppIcon />
                Chat on WhatsApp
              </Button>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
