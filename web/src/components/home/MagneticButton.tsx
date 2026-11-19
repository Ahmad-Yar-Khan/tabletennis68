"use client";

import { m, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: ReactNode;
  /** How far (0–1) the button leans towards the cursor. */
  strength?: number;
  className?: string;
};

const spring = { stiffness: 220, damping: 18, mass: 0.4 };
const MAX_SHIFT = 12;

/**
 * Wrap a button/link so it is pulled towards the mouse cursor when it comes close.
 * The padding widens the "magnetic" zone. Mouse only; no effect for touch or reduced motion.
 */
export function MagneticButton({
  children,
  strength = 0.35,
  className,
}: MagneticButtonProps) {
  const reduceMotion = useReducedMotion();
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clamp = (v: number) => Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, v));
    x.set(clamp((e.clientX - (rect.left + rect.width / 2)) * strength));
    y.set(clamp((e.clientY - (rect.top + rect.height / 2)) * strength));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <span
      className={cn("-m-3 inline-flex p-3", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      <m.span className="inline-flex" style={{ x, y }}>
        {children}
      </m.span>
    </span>
  );
}
