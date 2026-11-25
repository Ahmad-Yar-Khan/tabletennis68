import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import type { Banner } from "@/lib/types";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";
import { BannerSlider } from "./BannerSlider";
import { HeroCanvas } from "./HeroCanvas";
import { MagneticButton } from "./MagneticButton";

type HeroBannerProps = {
  banners: Banner[];
  whatsappNumber: string | null;
  shopName: string;
};

/**
 * Home hero on dark ink with faint table lines and the interactive ping-pong ball.
 * Shows the owner's active banners as a slider, or a bold typographic hero when there are none.
 */
export function HeroBanner({
  banners,
  whatsappNumber,
  shopName,
}: HeroBannerProps) {
  return (
    <section
      aria-label="Welcome"
      className="relative isolate overflow-hidden bg-ink text-white [--slant:1.5rem] slant-bottom sm:[--slant:3rem]"
    >
      {/* Faint "table lines": centre line, net line and side edges of a table seen from above. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
        <div className="absolute inset-y-0 left-4 w-px bg-white/5 sm:left-8" />
        <div className="absolute inset-y-0 right-4 w-px bg-white/5 sm:right-8" />
      </div>

      {/* Layer order: banner photos (z-0) → ball canvas (z-[1]) → text and buttons (z-[2]). */}
      {/* Must be a direct child of the <section>: it listens to the pointer on its parent. */}
      <HeroCanvas />


      {banners.length > 0 ? (
        <>
          <h1 className="sr-only">
            {shopName}: table tennis equipment in Pakistan
          </h1>
          <BannerSlider banners={banners} />
        </>
      ) : (
        <Container className="relative z-[2] flex min-h-[24rem] flex-col justify-center py-10 pb-16 sm:min-h-[36rem] sm:py-24 sm:pb-32 lg:min-h-[40rem]">
          <p className="font-display text-lg font-bold tracking-wider text-coral uppercase italic">
            Table tennis gear · Pakistan
          </p>
          <h1 className="mt-2 max-w-3xl text-[2.75rem] leading-none uppercase sm:mt-3 sm:text-7xl lg:text-8xl">
            Gear up.
            <br />
            <span className="text-coral">Play faster.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-light sm:mt-5 sm:text-lg">
            Genuine rackets, blades, rubbers and balls from the brands the pros
            use. Order in one tap on WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
            <MagneticButton>
              <Button href="/shop/" size="lg">
                Shop now
                <ArrowRight aria-hidden />
              </Button>
            </MagneticButton>
            {whatsappNumber && (
              <MagneticButton>
                <Button
                  href={buildWhatsAppLink(
                    whatsappNumber,
                    greetingMessage(shopName),
                  )}
                  size="lg"
                  variant="ghost"
                  className="border-2 border-white/25 text-white hover:border-white"
                >
                  <WhatsAppIcon />
                  Ask on WhatsApp
                </Button>
              </MagneticButton>
            )}
          </div>
        </Container>
      )}
    </section>
  );
}
