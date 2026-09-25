"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ShowcaseCard {
  id: string;
  image: string;
  title: string;
  category: string;
  accentBadge: string;
}

const CARDS: ShowcaseCard[] = [
  {
    id: "interfaces",
    image: "/assets/card_creative_jam.jpg",
    title: "WGMI Jam",
    category: "Interaction & Systems",
    accentBadge: "UI/UX",
  },
  {
    id: "dimension-3d",
    image: "/assets/card_creative_3d.jpg",
    title: "WGMI 3D",
    category: "Spatial & Prototyping",
    accentBadge: "3D Motion",
  },
  {
    id: "creative-direction",
    image: "/assets/card_creative_podcast.jpg",
    title: "WGMI Podcast",
    category: "Design Leadership",
    accentBadge: "Creative",
  },
];

export const DesignShowcaseSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Unified section entrance timeline with stable section trigger
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      if (headerRef.current) {
        masterTl.fromTo(
          headerRef.current,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      }

      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.querySelectorAll(".showcase-card");
        masterTl.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.14,
            ease: "power3.out",
          },
          "-=0.5"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="design-showcase-section"
      className="relative w-full min-h-screen bg-black text-white px-4 sm:px-8 py-24 sm:py-32 overflow-hidden select-none"
    >
      {/* Top transition border line separating white section from black section */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Background Grey Dotted Grid Pattern on Dark Surface */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="black-grid-dots"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="16" cy="16" r="1.25" fill="#ffffff" opacity="0.14" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#black-grid-dots)" />
        </svg>

        {/* Ambient subtle glow lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[300px] bg-purple-500/[0.04] rounded-full blur-[130px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Center Header: "The way design should've been done in the first place" */}
        <div ref={headerRef} className="w-full text-center mb-14 sm:mb-20 opacity-0">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.6rem] text-white tracking-[-0.025em] leading-[1.18] max-w-3xl mx-auto"
            style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontWeight: 600,
            }}
          >
            <span>The way design </span>
            <span
              className="font-normal italic text-[#ffffff]/95"
              style={{
                fontFamily: "var(--font-playfair), serif",
                letterSpacing: "-0.01em",
              }}
            >
              should&apos;ve
            </span>
            <br />
            <span>been done in the first place</span>
          </h2>
        </div>

        {/* 3 Glassmorphic Showcase Cards Grid */}
        <div
          ref={cardsContainerRef}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
        >
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="showcase-card group relative rounded-[28px] p-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] hover:border-white/[0.28] hover:bg-white/[0.07] transition-all duration-500 shadow-[0_24px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_32px_64px_rgba(0,0,0,0.85),0_0_30px_rgba(255,255,255,0.06)] hover:-translate-y-2 cursor-pointer flex flex-col opacity-0 will-change-transform"
            >
              {/* Card Artwork Viewport */}
              <div className="w-full aspect-square rounded-[20px] overflow-hidden relative bg-[#121212] border border-white/[0.08]">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover object-center filter contrast-[1.03] transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Subtle glass reflection highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none" />

                {/* Category Pill Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white/90 tracking-wide uppercase">
                  {card.accentBadge}
                </div>
              </div>

              {/* Card Content Footer */}
              <div className="w-full pt-5 pb-2 px-1 flex flex-col items-center text-center">
                <h3
                  className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-white transition-colors"
                  style={{
                    fontFamily: "var(--font-sora), sans-serif",
                  }}
                >
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-white/50 tracking-wide mt-1.5 flex items-center gap-1.5">
                  <span>✦</span>
                  <span>{card.category}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
