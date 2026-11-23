/*
 * Runs before `npm run build` (the "prebuild" script).
 *
 * Next.js saves every fetch made while pre-rendering in .next/cache/fetch-cache and, for a
 * static site, keeps it for a year. A later build then re-uses those saved Sanity responses
 * instead of asking Sanity again, so a rebuild after the owner publishes could show OLD prices.
 * Deleting the folder makes every build read the latest published content.
 */
import { rmSync } from "node:fs";

rmSync(new URL("../.next/cache/fetch-cache", import.meta.url), {
  recursive: true,
  force: true,
});
