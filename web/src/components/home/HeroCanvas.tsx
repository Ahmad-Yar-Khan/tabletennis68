"use client";

import { useEffect, useRef } from "react";

/*
 * The hero's ping-pong ball, drawn on one <canvas>.
 * - Mouse: the ball follows the cursor with a spring lag, leaving a coral trail under a soft red spotlight.
 * - Click/tap anywhere in the hero: a "smash" ripple and a kick to the ball.
 * - Touch / no hover, or the mouse is outside the hero: the ball bounces on its own in a gentle arc.
 * - The loop pauses when the hero is off-screen or the tab is hidden.
 * - prefers-reduced-motion: one static ball, no animation.
 * Colours match the theme tokens in globals.css.
 */

const CORAL = "255, 90, 95";
const RED = "225, 29, 46";

const TRAIL_LENGTH = 16;
const FOLLOW = { stiffness: 140, damping: 16 };
const BOUNCE = { stiffness: 260, damping: 24 };
const RIPPLE_MS = 650;
const HOP_SECONDS = 1.15;

type Point = { x: number; y: number };
type Ripple = Point & { start: number };

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // The hero <section>: pointer events from any text or button inside it bubble up here.
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let radius = 12;

    const ball = { x: 0, y: 0, vx: 0, vy: 0, squash: 0 };
    const trail: Point[] = [];
    const ripples: Ripple[] = [];
    let pointer: Point | null = null;

    let frame = 0;
    let last = 0;
    let elapsed = 0;
    let onScreen = true;

    /** Where the ball rests when nothing moves it (static version and start position). */
    const restPoint = (): Point => ({
      x: width * (width < 768 ? 0.82 : 0.78),
      y: height * 0.42,
    });

    /** Gentle bouncing arc across the hero (hops along x, parabola in y). */
    const bouncePoint = (t: number): Point => {
      const hop = (t / HOP_SECONDS) % 1;
      const lift = 4 * hop * (1 - hop); // 0 → 1 → 0
      // Triangle wave across the width, 6 hops each way.
      const sweep = (t / (HOP_SECONDS * 6)) % 2;
      const across = sweep < 1 ? sweep : 2 - sweep;
      const left = width < 768 ? 0.1 : 0.45;
      const right = 0.92;
      return {
        x: width * (left + (right - left) * across),
        y: height * 0.9 - lift * height * (width < 768 ? 0.3 : 0.45),
      };
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = width < 640 ? 10 : 14;
      if (!ball.x && !ball.y) Object.assign(ball, restPoint());
      if (reducedMotion.matches) drawStatic();
    };

    const drawSpotlight = (p: Point, size: number, alpha: number) => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
      g.addColorStop(0, `rgba(${RED}, ${alpha})`);
      g.addColorStop(1, `rgba(${RED}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(p.x - size, p.y - size, size * 2, size * 2);
    };

    const drawBall = (p: Point, squash = 0, angle = 0) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.scale(1 + squash, 1 - squash);
      // Soft glow
      const glow = ctx.createRadialGradient(0, 0, radius * 0.6, 0, 0, radius * 2.6);
      glow.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 2.6, 0, Math.PI * 2);
      ctx.fill();
      // Ball with a little shading so it reads as a sphere
      const shade = ctx.createRadialGradient(
        -radius * 0.35, -radius * 0.4, radius * 0.1,
        0, 0, radius,
      );
      shade.addColorStop(0, "#ffffff");
      shade.addColorStop(0.7, "#ffffff");
      shade.addColorStop(1, "#f0dede");
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    function drawStatic() {
      ctx!.clearRect(0, 0, width, height);
      const p = restPoint();
      drawSpotlight(p, Math.max(width, height) * 0.4, 0.28);
      drawBall(p);
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const speed = Math.hypot(ball.vx, ball.vy);

      drawSpotlight(ball, Math.min(Math.max(width, height) * 0.45, 420), 0.26);

      // Trail: fading coral dots that shrink towards the tail.
      for (let i = 0; i < trail.length; i++) {
        const k = (i + 1) / trail.length;
        ctx.fillStyle = `rgba(${CORAL}, ${0.45 * k * k})`;
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, radius * (0.25 + 0.6 * k), 0, Math.PI * 2);
        ctx.fill();
      }

      // Smash ripples: two rings expanding and fading out.
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const t = (now - r.start) / RIPPLE_MS;
        if (t >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const ease = 1 - (1 - t) ** 3;
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${CORAL}, ${0.8 * (1 - t)})`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius + ease * 90, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - t)})`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius + ease * 50, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Stretch slightly along the direction of travel.
      const stretch = Math.min(speed / 4000, 0.18) + ball.squash;
      drawBall(ball, stretch, Math.atan2(ball.vy, ball.vx));
    };

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
      last = now;
      elapsed += dt;

      // `pointer` is only set by a real mouse inside the hero (touch never sets it).
      const following = pointer !== null;
      const target = pointer ?? bouncePoint(elapsed);
      const { stiffness, damping } = following ? FOLLOW : BOUNCE;

      ball.vx += (stiffness * (target.x - ball.x) - damping * ball.vx) * dt;
      ball.vy += (stiffness * (target.y - ball.y) - damping * ball.vy) * dt;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      ball.squash *= Math.exp(-10 * dt);

      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > TRAIL_LENGTH) trail.shift();

      draw(now);
    };

    const start = () => {
      if (frame || reducedMotion.matches || !onScreen || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(step);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const localPoint = (e: PointerEvent): Point => {
      const rect = host.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pointer = localPoint(e);
    };
    const onPointerLeave = () => {
      pointer = null;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (reducedMotion.matches) return;
      const p = localPoint(e);
      ripples.push({ ...p, start: performance.now() });
      if (ripples.length > 4) ripples.shift();
      // Smash: kick the ball away from the click point and squash it.
      const dx = ball.x - p.x;
      const dy = ball.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const kick = 900 * Math.max(0.3, 1 - dist / 400);
      ball.vx += (dx / dist) * kick;
      ball.vy += (dy / dist) * kick;
      ball.squash = 0.25;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotionChange = () => {
      if (reducedMotion.matches) {
        stop();
        trail.length = 0;
        ripples.length = 0;
        drawStatic();
      } else {
        start();
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    const ro = new ResizeObserver(resize);

    resize();
    ro.observe(host);
    io.observe(host);
    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave);
    host.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionChange);
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] size-full"
    />
  );
}
