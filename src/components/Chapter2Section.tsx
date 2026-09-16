"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────── */
/* Quote text for background scrolling rows                */
/* ─────────────────────────────────────────────────────── */
const QUOTE = "WITH GREAT POWER COMES GREAT RESPONSIBILITY.";
const PHRASE_COUNT = 14;

/* ─────────────────────────────────────────────────────── */
/* Chapter2Section — Zoom-Out Scroll Effect                */
/*                                                         */
/* Wraps children (LandoHeroSection) and scales them down  */
/* on scroll, revealing 2 middle text lines moving only    */
/* during active scroll via GSAP ScrollTrigger.            */
/* ─────────────────────────────────────────────────────── */
export const Chapter2Section: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heroContainer = heroContainerRef.current;
    const bg = bgRef.current;
    const textLayer = textLayerRef.current;
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    if (!section || !heroContainer || !bg || !textLayer || !row1 || !row2) return;

    const ctx = gsap.context(() => {
      /* ── Scroll-Driven Animation ── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          pin: stickyRef.current,
          pinSpacing: false,
        },
      });

      // ─────────────────────────────────────────────────────────────
      // 1. HERO ZOOM-OUT (0.0 → 0.5):
      // Hero zooms down to its end stage limit (0.38 scale) during the
      // first half of scroll. From 0.5 → 1.0 (the 1 additional scroll phase),
      // the hero stays fixed at 0.38.
      // ─────────────────────────────────────────────────────────────
      tl.fromTo(
        heroContainer,
        {
          scale: 1,
          borderRadius: "0px",
        },
        {
          scale: 0.38,
          borderRadius: "24px",
          ease: "power2.out",
          duration: 0.5,
        },
        0
      );

      // Background overlay fades in during initial zoom
      tl.fromTo(
        bg,
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: 0.4 },
        0
      );

      // Text layer fades in smoothly right at the start so it's visible
      tl.fromTo(
        textLayer,
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: 0.18 },
        0.02
      );

      // ─────────────────────────────────────────────────────────────
      // 2. SMOOTH GSAP SCROLLING TEXT (0.0 → 1.0):
      // - Active and moving during the hero zoom-out phase (0.0 → 0.5)
      // - Continues scrolling through the 1 additional scroll phase (0.5 → 1.0)
      //   after the hero reaches its zoom end stage!
      // ─────────────────────────────────────────────────────────────
      tl.fromTo(
        row1,
        { xPercent: -4 },
        { xPercent: -34, ease: "none", duration: 1 },
        0
      );

      tl.fromTo(
        row2,
        { xPercent: -34 },
        { xPercent: -4, ease: "none", duration: 1 },
        0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Line 1 Phrases — Marvel cinematic font (Clean solid white, zero glow)
  const row1Phrases = Array.from({ length: PHRASE_COUNT }, (_, i) => (
    <span
      key={i}
      className="inline-block whitespace-nowrap px-6 sm:px-10 lg:px-14 font-black uppercase text-white select-none leading-none"
      style={{
        fontSize: "clamp(2.8rem, 5.8vw, 6rem)",
        color: "#ffffff",
        textShadow: "none",
        fontFamily: "var(--font-bebas), var(--font-marvel), sans-serif",
        letterSpacing: "0.05em",
        lineHeight: "1",
      }}
      aria-hidden={i > 0 ? true : undefined}
    >
      {QUOTE}
    </span>
  ));

  // Line 2 Phrases — Comic handwritten font (Clean solid white, zero glow)
  const row2Phrases = Array.from({ length: PHRASE_COUNT }, (_, i) => (
    <span
      key={i}
      className="inline-block whitespace-nowrap px-6 sm:px-10 lg:px-14 text-white select-none leading-none"
      style={{
        fontSize: "clamp(2.2rem, 4.5vw, 4.8rem)",
        color: "#ffffff",
        textShadow: "none",
        fontFamily: "var(--font-handwritten), 'Permanent Marker', cursive",
        letterSpacing: "0.02em",
        lineHeight: "1",
      }}
      aria-hidden={i > 0 ? true : undefined}
    >
      {QUOTE}
    </span>
  ));

  return (
    <section
      ref={sectionRef}
      id="chapter-2-scroll"
      className="relative w-full"
      style={{ height: "360vh" }}
    >
      {/* Sticky Viewport — stays pinned for scroll choreography */}
      <div
        ref={stickyRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* ────────────────────────────────────────────── */}
        {/* LAYER 1: Dark Background (fades in on scroll) */}
        {/* ────────────────────────────────────────────── */}
        <div
          ref={bgRef}
          className="absolute inset-0 w-full h-full z-0"
          style={{ background: "#0a0a0a", opacity: 0 }}
        >
          {/* Subtle organic SVG texture overlay (topographic contours) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: 0.035,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 10 Q40 30 20 50 Q0 70 20 90' fill='none' stroke='%23ffffff' stroke-width='0.6'/%3E%3Cpath d='M50 5 Q70 25 50 45 Q30 65 50 85' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cpath d='M80 15 Q60 35 80 55 Q100 75 80 95' fill='none' stroke='%23ffffff' stroke-width='0.6'/%3E%3C/svg%3E")`,
              backgroundSize: "180px 180px",
            }}
          />
        </div>

        {/* ────────────────────────────────────────────── */}
        {/* LAYER 2: Middle 2 Text Lines                   */}
        {/* Balanced spacing between lines, No Glow        */}
        {/* Scrolls during zoom & for 1 scroll after       */}
        {/* ────────────────────────────────────────────── */}
        <div
          ref={textLayerRef}
          className="absolute inset-0 w-full h-full z-10 flex flex-col justify-center items-center gap-3 sm:gap-4 lg:gap-5 pointer-events-none select-none overflow-hidden"
          style={{ opacity: 0 }}
        >
          {/* Line 1 — Marvel Font (translates left on scroll) */}
          <div className="w-full overflow-hidden flex items-center py-1 my-0 leading-none">
            <div
              ref={row1Ref}
              className="flex flex-nowrap will-change-transform"
              style={{ width: "max-content" }}
            >
              {row1Phrases}
            </div>
          </div>

          {/* Line 2 — Handwritten Font (translates right on scroll) */}
          <div className="w-full overflow-hidden flex items-center py-1 my-0 leading-none">
            <div
              ref={row2Ref}
              className="flex flex-nowrap will-change-transform"
              style={{ width: "max-content" }}
            >
              {row2Phrases}
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────── */}
        {/* LAYER 3: Hero Container (scales down on scroll)*/}
        {/* The children (LandoHeroSection) live inside    */}
        {/* ────────────────────────────────────────────── */}
        <div className="absolute inset-0 w-full h-full z-20 flex items-center justify-center pointer-events-none">
          <div
            ref={heroContainerRef}
            className="relative w-full h-full overflow-hidden will-change-transform pointer-events-auto shadow-2xl"
            style={{ transformOrigin: "center center" }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};
