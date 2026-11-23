"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Fetched in its own chunk after the page has loaded, instead of in the main bundle. */
const loadFeatures = () => import("./motionFeatures").then((mod) => mod.default);

/**
 * Loads Motion's small DOM feature set once for the whole app (use `m.*`, not `motion.*`)
 * and makes animations instant for visitors who prefer reduced motion.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
