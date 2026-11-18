import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: every page is pre-built into web/out (see CLAUDE.md).
  output: "export",
  // next/image optimisation needs a server; images come from the Sanity CDN instead.
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
