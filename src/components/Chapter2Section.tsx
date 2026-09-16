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

      // Hero container: scale down from 1.0 → 0.38 with rounded corners
      tl.fromTo(
        heroContainer,
        {
          scale: 1,
          borderRadius: "0px",
        },
        {
          scale: 0.38,
          borderRadius: "24px",
          ease: "power1.inOut",
        },
        0
      );

      // Background: fade from transparent black to solid dark
      tl.fromTo(
        bg,
        { opacity: 0 },
        { opacity: 1, ease: "none" },
        0
      );

      // Text layer: fade in as hero shrinks
      tl.fromTo(
        textLayer,
        { opacity: 0 },
        { opacity: 1, ease: "none" },
        0.04
      );

      // Background text movement: strictly triggered by scrolling (GSAP scrub)
      // Line 1: translates towards the left as user scrolls down
      tl.fromTo(
        row1,
        { xPercent: -8 },
        { xPercent: -22, ease: "none" },
        0
      );

      // Line 2: translates towards the right as user scrolls down
      tl.fromTo(
        row2,
        { xPercent: -22 },
        { xPercent: -8, ease: "none" },
        0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const rowPhrases = Array.from({ length: PHRASE_COUNT }, (_, i) => (
    <span
      key={i}
      className="inline-block whitespace-nowrap px-6 sm:px-10 lg:px-14 font-sora font-black italic uppercase tracking-wider text-white select-none"
      style={{
        fontSize: "clamp(2.5rem, 5.5vw, 5.5rem)",
        color: "#ffffff",
        textShadow:
          "0 0 35px rgba(255,255,255,0.22), 0 0 70px rgba(255,255,255,0.08)",
        fontFamily: "var(--font-sora), sans-serif",
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
      style={{ height: "480vh" }}
    >
      {/* Sticky Viewport — stays pinned for 480vh scroll distance */}
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
        {/* Moves ONLY when scrolling via GSAP scrub       */}
        {/* White color, Sora font, elegant spacing        */}
        {/* ────────────────────────────────────────────── */}
        <div
          ref={textLayerRef}
          className="absolute inset-0 w-full h-full z-10 flex flex-col justify-center items-center gap-4 sm:gap-8 pointer-events-none select-none overflow-hidden"
          style={{ opacity: 0 }}
        >
          {/* Line 1 — translates left on scroll */}
          <div className="w-full overflow-hidden flex items-center py-2">
            <div
              ref={row1Ref}
              className="flex flex-nowrap will-change-transform"
              style={{ width: "max-content" }}
            >
              {rowPhrases}
            </div>
          </div>

          {/* Line 2 — translates right on scroll */}
          <div className="w-full overflow-hidden flex items-center py-2">
            <div
              ref={row2Ref}
              className="flex flex-nowrap will-change-transform"
              style={{ width: "max-content" }}
            >
              {rowPhrases}
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
