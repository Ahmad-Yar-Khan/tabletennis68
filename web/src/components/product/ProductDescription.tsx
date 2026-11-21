import type { PortableTextBlock } from "next-sanity";
import { RichText } from "@/components/ui/RichText";

/** Product description from Sanity (Portable Text). Hidden when empty. */
export function ProductDescription({ value }: { value: PortableTextBlock[] }) {
  if (value.length === 0) return null;

  return (
    <section aria-labelledby="description-heading">
      <h2 id="description-heading" className="mb-3 text-2xl uppercase">
        Description
      </h2>
      <div className="max-w-prose-narrow leading-relaxed text-ink/85 [&_h3]:text-xl">
        <RichText value={value} />
      </div>
    </section>
  );
}
