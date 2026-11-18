import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Placeholder until the home page step: shows the design system inside the new layout.
export default function Home() {
  return (
    <>
      <section className="bg-ink text-surface">
        <Container className="py-16 sm:py-24">
          <p className="font-display text-lg font-semibold tracking-wider text-ball uppercase">
            Coming soon
          </p>
          <h1 className="mt-2 max-w-3xl text-5xl uppercase sm:text-7xl">
            Gear up. <span className="text-rubber">Play faster.</span>
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
