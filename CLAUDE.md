# tabletennis68 — Project Context

This file gives you (Claude Code) the full context for this project. Read it before every task. Follow the conventions here unless the prompt says otherwise.

## What we are building

**tabletennis68** is a product showcase website for a table tennis equipment shop in Pakistan.

- Customers **browse** products (rackets, blades, rubbers, balls, grips, shoes, bags, tables, accessories).
- There is **no cart checkout and no online payment**. Customers order by tapping **"Order on WhatsApp"**, which opens WhatsApp with a pre-filled message to the shop owner (product, selected options, price, link).
- Customers can also build an **enquiry list** (a "WhatsApp cart") of several items and send it as one WhatsApp message. It is stored in `localStorage`, with no backend.
- The **shop owner adds and edits products himself** in an admin panel (Sanity Studio). He is not technical, so the admin must be simple, with plain-language labels.
- Most visitors are on **mid-range Android phones over mobile data**. Mobile-first and speed are top priorities.
- Currency is Pakistani Rupees. Display prices as `Rs 12,500` (use `Intl.NumberFormat('en-PK')`, no decimals).
- Logo: **none yet**. Use a clean text wordmark "tabletennis68" as a placeholder component (`<Logo />`) so it can be swapped later.

## Tech stack (do not add other frameworks without asking)

| Area | Choice |
| --- | --- |
| Frontend | **Next.js** (latest stable, App Router, TypeScript, strict mode) |
| Rendering | **Static export**: `output: 'export'` in `next.config`. Every page is pre-built at build time. |
| Styling | **Tailwind CSS** (latest, v4 CSS-first config with `@theme`) |
| Animation | **Motion** (`motion` package, `import { m, LazyMotion, domAnimation } from 'motion/react'`). Use `LazyMotion` + `m` components to keep the bundle small. |
| CMS / admin | **Sanity** (Sanity Studio v3+, hosted with `sanity deploy`) |
| Data fetching | `next-sanity` client + GROQ, **at build time only** |
| Images | Sanity image CDN via `@sanity/image-url` (set width + `auto('format')`). `next.config` must set `images.unoptimized: true`, because `next/image` optimisation does not work with static export. |
| Fonts | `next/font/google` (max 2 families) |
| Icons | `lucide-react` |
| Hosting | **Cloudflare Pages** (static files from `web/out`) |
| Auto-deploy | Sanity webhook on publish → Cloudflare Pages deploy hook → rebuild |

### Static export rules (important)
- No API routes, no server actions, no middleware, no ISR/revalidate, no `cookies()`/`headers()`.
- Every dynamic route must have `generateStaticParams` and `export const dynamicParams = false`.
- Search, filters and sorting run **client-side** over product data that is built into the page.
- Metadata routes (`sitemap.ts`, `robots.ts`) must be static (`export const dynamic = 'force-static'`).
- `npm run build` must succeed and produce `web/out`.

## Repository structure

```
/
├── CLAUDE.md
├── web/                  # Next.js site
│   ├── src/app/          # routes
│   ├── src/components/   # UI components (ui/, layout/, product/, home/)
│   ├── src/lib/          # sanity client, queries, types, utils (price, whatsapp)
│   └── .env.local        # NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
├── studio/               # Sanity Studio (admin panel)
│   ├── schemaTypes/
│   └── .env              # SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET
└── docs/                 # handover + owner guide
```

## Content model (Sanity)

**product**
- `name` (string, required)
- `slug` (slug from name, required)
- `category` (reference → category, required)
- `brand` (reference → brand)
- `price` (number, PKR, required)
- `salePrice` (number, optional; must be lower than price)
- `images` (array of images with hotspot; first = main; at least 1 required; each has `alt`)
- `shortDescription` (text, max ~160 chars, used on cards and SEO)
- `description` (Portable Text)
- `options` (array of `{ name: string, values: string[] }`). This is generic, so the owner can define e.g. `Handle: FL, ST, AN`, `Colour: Red, Black`, `Thickness: 1.8, 2.0, 2.1, Max`, `Pack: 3, 6, 12 balls`, `Size: 40–45`.
- `specs` (array of `{ label, value }`, e.g. `Plies: 5 wood`, `Speed: OFF`, `Weight: 85 g`, `Control: 8.5`)
- `inStock` (boolean, default true)
- `featured` (boolean)
- `isNew` (boolean)
- `sortOrder` (number, optional)

**category**: `name`, `slug`, `image`, `description`, `order`
Default categories: Rackets, Blades, Rubbers, Balls, Grips & Accessories, Shoes, Bags & Cases, Tables & Nets.

**brand**: `name`, `slug`, `logo` (optional)
Examples: Butterfly, DHS, Stiga, Yasaka, Nittaku, Donic, Joola, Tibhar, Xiom, 729 Friendship.

**banner**: `image`, `heading`, `subheading`, `buttonText`, `buttonLink`, `order`, `active`

**siteSettings** (singleton): `shopName`, `whatsappNumber` (international format without +, e.g. `923001234567`), `phone`, `email`, `address`, `mapsUrl`, `mapEmbedUrl`, `openingHours`, `instagramUrl`, `facebookUrl`, `announcementText`, `deliveryInfo`, `aboutText` (Portable Text)

Studio must be owner-friendly: a clear desk structure (Products, Categories, Brands, Banners, Site Settings as a single doc), helpful field descriptions, validation messages in plain English, and list previews that show image, price and category.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home: hero banners, shop by category, new arrivals, featured products, shop by brand, why buy from us, store location strip |
| `/shop` | All products with filters (category, brand, price range, in stock), sort (newest, price low→high, high→low, name), search |
| `/category/[slug]` | Products in one category (same filter UI, category pre-selected) |
| `/brand/[slug]` | Products from one brand |
| `/product/[slug]` | Gallery, price/sale, option selectors, specs table, description, Order on WhatsApp, Add to enquiry list, related products |
| `/enquiry` | Enquiry list page (also available as a slide-over drawer) |
| `/contact` | Address, map, hours, WhatsApp/phone/email buttons, delivery info |
| `/about` | About the shop |
| `/404` | Friendly not-found with links |

## WhatsApp ordering

- Build links with `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}` in one helper: `src/lib/whatsapp.ts`.
- Single-product message includes the product name, each selected option, quantity, unit price (sale price if any), and the absolute product URL.
- If a product has options, the WhatsApp button stays disabled until every option is chosen (with a helpful hint).
- Out-of-stock products show the button as "Ask about restock" with a matching message.
- The enquiry list message lists every item (name, options, qty, price) plus an estimated total, and ends with a note that delivery charges will be confirmed.
- Floating WhatsApp button on every page with a general greeting message.
- The site URL comes from `NEXT_PUBLIC_SITE_URL` (default `https://tabletennis68.com`).

## Design direction

- Sporty, clean, premium and energetic. It should feel like a modern sports brand, not a template.
- Palette (tweakable via Tailwind theme tokens): deep navy/near-black base, crisp white surfaces, **rubber red** as the primary accent, **table blue** as the secondary, and a **ball orange** highlight used sparingly (e.g. "New" badges). Ensure WCAG AA contrast.
- Typography: a bold, slightly condensed display font for headings and a clean sans for body.
- Rounded corners, generous spacing, large product photos on clean backgrounds.
- Mobile-first: everything must work at 360 px width. Bottom-sheet filters on mobile, sidebar on desktop.
- Badges: Sale (with % off), New, Out of stock.

## Performance and quality bar

- Target **90+ Lighthouse mobile** performance and accessibility.
- Request Sanity images at the size actually displayed (~400 px cards, ~1000 px gallery), with `auto=format`; lazy-load below the fold; always set width/height.
- Animate only `transform` and `opacity`; respect `prefers-reduced-motion`.
- Keep client components small. Pages are server components that pass pre-fetched data down.
- Semantic HTML, keyboard accessible, visible focus states, alt text on all images.

## Conventions

- TypeScript everywhere; shared types in `src/lib/types.ts` that match the GROQ projections.
- Components: PascalCase files, one component per file, Tailwind classes only (no CSS modules).
- Utilities: `formatPrice`, `getDiscountPercent`, `buildWhatsAppLink`, `urlForImage`.
- No secrets in client code. Only `NEXT_PUBLIC_*` env vars are used in `web` (the dataset is public read).
- After each task: run `npm run lint` and `npm run build` in the affected app, fix all errors, then summarise what changed and anything I need to do manually.
- Commit-sized work: keep each task focused; don't refactor unrelated code.
- If something in a prompt conflicts with this file, ask before proceeding.
