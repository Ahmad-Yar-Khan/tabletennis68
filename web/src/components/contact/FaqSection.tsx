import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { FaqItem } from "@/lib/faq";

/**
 * Frequently asked questions as an accordion. Uses <details>/<summary>, so it works
 * without JavaScript and is keyboard accessible. Also outputs FAQPage structured data for Google.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section aria-labelledby="faq-heading">
      <SectionHeading
        id="faq-heading"
        title="Questions? Answers."
        subtitle="The things customers ask us most."
      />
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <details
            key={item.question}
            // First answer open, so it's clear the rows expand.
            open={i === 0}
            className="group rounded-card border border-line bg-white transition-colors open:border-ink/20 open:shadow-card"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-card px-4 py-3 font-medium sm:px-5 [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-blush text-crimson transition-transform duration-200 group-open:rotate-45">
                <Plus aria-hidden className="size-4" />
              </span>
            </summary>
            <p className="-mt-1 px-4 pb-4 leading-relaxed whitespace-pre-line text-muted sm:px-5 sm:pb-5">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        // JSON.stringify output is safe here except for "</": escape it.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  );
}
