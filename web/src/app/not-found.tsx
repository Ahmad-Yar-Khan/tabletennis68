import { ArrowRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import { categoriesQuery } from "@/lib/sanity/queries";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Friendly 404 (exported as out/404.html; Cloudflare Pages serves it for unknown URLs).
 * The search box is a plain GET form to /shop/?q=…, so it works even before JavaScript loads.
 */
export default async function NotFound() {
  const categories = (await sanityFetch<Category[]>(categoriesQuery)).filter(
    (c) => c.productCount > 0,
  );

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-12 pb-20 text-white [--slant:1.5rem] slant-bottom sm:pt-16 sm:pb-28 sm:[--slant:2.5rem]">
        {/* Faint table: centre line, net line and a red glow. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/[0.06]" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.06]" />
          <div className="absolute -bottom-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-red/20 blur-3xl" />
        </div>

        <Container className="relative flex flex-col items-center text-center">
          {/* "404" with a ping-pong ball as the zero */}
          <p
            aria-hidden
            className="flex items-center gap-2 font-display text-[7rem] leading-none font-extrabold italic sm:text-[10rem]"
          >
            <span>4</span>
            <span className="relative inline-block size-[0.62em] -translate-y-[0.04em] rounded-full bg-white shadow-[0_0_60px_rgb(255_90_95/0.45)]">
              <span className="absolute top-[18%] left-[22%] size-[22%] rounded-full bg-white/80 blur-[2px]" />
            </span>
            <span className="text-coral">4</span>
          </p>
          <h1 className="mt-4 text-4xl uppercase sm:text-5xl">
            Out! That one missed the table.
          </h1>
          <p className="mt-3 max-w-prose-narrow text-muted-light sm:text-lg">
            We couldn&apos;t find the page you were looking for. It may have
            moved, or the product is no longer listed. Try a search instead.
          </p>

          <Form
            action="/shop/"
            role="search"
            className="mt-8 flex w-full max-w-lg items-center gap-2"
          >
            <label htmlFor="notfound-search" className="sr-only">
              Search products
            </label>
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
              />
              <input
                id="notfound-search"
                name="q"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Rackets, rubbers, brands…"
                className="h-12 w-full rounded-pill border-2 border-transparent bg-white pr-4 pl-11 text-base text-ink outline-none placeholder:text-muted focus:border-red"
              />
            </div>
            <Button type="submit" size="md" className="h-12">
              Search
            </Button>
          </Form>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button href="/shop/" variant="outline">
              Shop all products
              <ArrowRight aria-hidden />
            </Button>
            <Button
              href="/"
              variant="ghost"
              className="border-2 border-white/20 hover:border-white/50"
            >
              Back to home
            </Button>
          </div>
        </Container>
      </section>

      {categories.length > 0 && (
        <Container
          as="section"
          aria-labelledby="notfound-categories"
          className="py-12 sm:py-16"
        >
          <h2
            id="notfound-categories"
            className="text-center text-3xl uppercase sm:text-4xl"
          >
            Or browse a category
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((c) => (
              <li key={c._id}>
                <Link
                  href={`/category/${c.slug}/`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line bg-white px-5 font-medium transition-colors hover:border-crimson hover:text-crimson"
                >
                  {c.name}
                  <span className="text-sm text-muted tabular-nums">
                    {c.productCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      )}
    </>
  );
}
