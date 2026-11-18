import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Sanity client for build-time fetching. `useCdn: false` so every build sees the
 * latest published content (the webhook rebuild runs right after a publish).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

/** Typed GROQ fetch. Call only from server components / generateStaticParams. */
export function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
): Promise<T> {
  return client.fetch<T>(query, params);
}
