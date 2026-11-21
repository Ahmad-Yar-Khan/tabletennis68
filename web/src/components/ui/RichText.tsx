import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "next-sanity";

/** Styles for the owner's rich text (studio/schemaTypes/objects/simpleBlock.ts: paragraphs, one heading, lists, bold, italic). */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-2xl text-ink uppercase first:mt-0">
        {children}
      </h3>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 flex list-none flex-col gap-1.5 last:mb-0">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 flex list-decimal flex-col gap-1.5 pl-5 marker:font-medium marker:text-crimson last:mb-0">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="relative pl-5">
        {/* Slanted red "table line" bullet */}
        <span
          aria-hidden
          className="absolute top-[0.55em] left-0.5 h-2 w-1 -skew-x-12 rounded-[1px] bg-red"
        />
        {children}
      </li>
    ),
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-ink">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
  },
};

/** Renders Portable Text from Sanity with the site's typography. Wrap it to set width and colour. */
export function RichText({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
