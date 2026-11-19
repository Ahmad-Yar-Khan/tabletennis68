import { HandCoins, ShieldCheck, Trophy, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const points = [
  {
    icon: ShieldCheck,
    title: "Genuine products",
    text: "Original gear from the brands we stock. No copies, no fakes.",
  },
  {
    icon: HandCoins,
    title: "Cash on delivery",
    text: "Pay when your order arrives at your door.",
  },
  {
    icon: Truck,
    title: "Nationwide delivery",
    text: "We ship to every city in Pakistan.",
  },
  {
    icon: Trophy,
    title: "Advice from players",
    text: "Not sure what to pick? We play too, so ask us on WhatsApp.",
  },
];

/** Four reasons to buy from the shop, on a white band. */
export function WhyBuyFromUs() {
  return (
    <section
      aria-labelledby="why-buy-from-us"
      className="border-y border-line bg-white"
    >
      <Container className="py-12 sm:py-16">
        <SectionHeading id="why-buy-from-us" title="Why buy from us" />
        <ul className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 lg:flex-col">
              <span className="inline-flex size-12 shrink-0 -skew-x-6 items-center justify-center rounded-xl bg-blush text-crimson">
                <Icon aria-hidden className="size-6 skew-x-6" />
              </span>
              <div>
                <h3 className="text-xl uppercase sm:text-2xl">{title}</h3>
                <p className="mt-1 text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
