"use client";

import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import type { Banner } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BannerSlide } from "./BannerSlide";

const AUTO_ADVANCE_MS = 6000;

/**
 * Banner slides in a horizontal scroll-snap track: native swipe on phones,
 * dots to jump, auto-advance every 6 s. Auto-advance pauses on hover, focus,
 * touch, off-screen, a hidden tab, the pause button, and for reduced motion.
 */
export function BannerSlider({ banners }: { banners: Banner[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();
  const count = banners.length;

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      track.scrollTo({
        left: i * track.clientWidth,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  // Keep the active dot in sync with swipes and scrolling.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setIndex(Math.round(track.scrollLeft / track.clientWidth)),
      );
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Only auto-advance while the slider is on screen and the tab is visible.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let onScreen = true;
    const update = () => setVisible(onScreen && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    io.observe(track);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Restarts on every slide change, so a manual swipe also resets the 6 s timer.
  const autoPlay =
    count > 1 && !interacting && !userPaused && visible && !reduceMotion;
  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setTimeout(
      () => goTo((index + 1) % count),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearTimeout(id);
  }, [autoPlay, index, count, goTo]);

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Offers"
      onPointerEnter={(e) => e.pointerType === "mouse" && setInteracting(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setInteracting(false)}
      onTouchStart={() => setInteracting(true)}
      onTouchEnd={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false);
      }}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner, i) => (
          <BannerSlide
            key={banner._id}
            banner={banner}
            position={i}
            count={count}
            active={i === index}
          />
        ))}
      </div>

      {count > 1 && (
        <Container className="absolute inset-x-0 bottom-8 z-[2] flex items-center gap-1 sm:bottom-14">
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            className="-ml-3 inline-flex size-11 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
          >
            {userPaused ? (
              <Play aria-hidden className="size-4" />
            ) : (
              <Pause aria-hidden className="size-4" />
            )}
          </button>
          {banners.map((banner, i) => (
            <button
              key={banner._id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show slide ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              className="group inline-flex size-11 items-center justify-center"
            >
              <span
                aria-hidden
                className={cn(
                  "h-1.5 w-6 -skew-x-12 rounded-[1px] transition-[scale,opacity] duration-300",
                  i === index
                    ? "scale-x-150 bg-coral"
                    : "bg-white opacity-40 group-hover:opacity-80",
                )}
              />
            </button>
          ))}
        </Container>
      )}
    </div>
  );
}
