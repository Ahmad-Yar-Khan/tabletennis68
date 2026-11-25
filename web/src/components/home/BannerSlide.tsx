import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { hasImage, imageSrcSet, imageUrl } from "@/lib/sanity/image";
import type { Banner } from "@/lib/types";
import { MagneticButton } from "./MagneticButton";

const IMAGE_WIDTHS = [640, 1024, 1600, 2400];

type BannerSlideProps = {
  banner: Banner;
  position: number;
  count: number;
  active: boolean;
};

/** One full-width hero slide: photo (first one loads eagerly), heading, text and a magnetic button. */
export function BannerSlide({ banner, position, count, active }: BannerSlideProps) {
  const { heading, subheading, buttonText, buttonLink, image } = banner;
  const hotspot = image?.hotspot;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position + 1} of ${count}`}
      // Off-screen slides can't be tabbed into or read out.
      inert={!active}
      className="relative flex min-h-[24rem] w-full shrink-0 snap-start snap-always items-end sm:min-h-[36rem] lg:min-h-[40rem] lg:items-center"
    >
      {hasImage(image) && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export: sized via the Sanity CDN */}
          <img
            src={imageUrl(image, 1600) ?? undefined}
            srcSet={imageSrcSet(image, IMAGE_WIDTHS)}
            sizes="100vw"
            alt={image.alt ?? ""}
            width={1600}
            height={900}
            loading={position === 0 ? "eager" : "lazy"}
            fetchPriority={position === 0 ? "high" : undefined}
            decoding="async"
            className="absolute inset-0 z-0 size-full object-cover"
            style={
              hotspot
                ? { objectPosition: `${hotspot.x * 100}% ${hotspot.y * 100}%` }
                : undefined
            }
          />
          {/* Keeps the text readable over any photo: bottom-up on phones, left-to-right on desktop. */}
          <div
            aria-hidden
            className="absolute inset-0 z-0 bg-linear-to-t from-ink via-ink/75 to-ink/10 lg:bg-linear-to-r lg:via-ink/60 lg:to-transparent"
          />
        </>
      )}

      <Container className="relative z-[2] pt-12 pb-20 sm:pt-16 sm:pb-32 lg:py-24">
        <div className="max-w-xl">
          {heading && (
            <h2 className="text-4xl uppercase sm:text-6xl lg:text-7xl">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-4 text-lg text-white/85">{subheading}</p>
          )}
          <div className="mt-6 sm:mt-8">
            <MagneticButton>
              <Button href={buttonLink || "/shop/"} size="lg">
                {buttonText || "Shop now"}
                <ArrowRight aria-hidden />
              </Button>
            </MagneticButton>
          </div>
        </div>
      </Container>
    </div>
  );
}
