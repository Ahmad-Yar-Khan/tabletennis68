import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Placeholder until the home page step: shows the design system inside the new layout.
export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white [--slant:1.5rem] slant-bottom sm:[--slant:3rem]">
        {/* Faint "table lines": the centre line and the side edges of a table seen from above. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
          <div className="absolute inset-y-0 left-4 w-px bg-white/5 sm:left-8" />
          <div className="absolute inset-y-0 right-4 w-px bg-white/5 sm:right-8" />
        </div>
        <Container className="relative py-16 pb-20 sm:py-24 sm:pb-32">
          <p className="font-display text-lg font-bold tracking-wider text-coral uppercase italic">
            Coming soon
          </p>
          <h1 className="mt-2 max-w-3xl text-5xl uppercase sm:text-7xl">
            Gear up. <span className="text-red">Play faster.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-light">
            Rackets, blades, rubbers and more. Order on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/shop/" size="lg">
              Shop now
            </Button>
            <Button href="/contact/" size="lg" variant="outline">
              Contact us
            </Button>
          </div>
        </Container>
      </section>

      <Container as="section" className="py-12">
        <SectionHeading
          title="Shop by category"
          subtitle="Coming in the next step."
          href="/shop/"
        />
        <div className="flex flex-wrap gap-2">
          <Badge variant="sale" percent={20} />
          <Badge variant="new" />
          <Badge variant="out-of-stock" />
        </div>
      </Container>
    </>
  );
}
