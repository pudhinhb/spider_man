"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Zap, Search, Quote } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface SkillPill {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  iconBgClass: string;
  icon: React.ReactNode;
  rotation: string;
}

const SKILLS: SkillPill[] = [
  {
    id: "interaction-design",
    name: "Interaction Design",
    bgClass: "bg-[#F3B72C] text-[#2c2005]",
    textClass: "text-[#241a05] font-semibold",
    iconBgClass: "bg-[#F3B72C]",
    icon: <Sparkles className="w-4 h-4 text-[#2c2005]" />,
    rotation: "-rotate-1",
  },
  {
    id: "prototyping",
    name: "Prototyping",
    bgClass: "bg-[#0FB66F] text-white",
    textClass: "text-white font-semibold",
    iconBgClass: "bg-[#0FB66F]",
    icon: <Zap className="w-4 h-4 text-white" />,
    rotation: "rotate-1",
  },
  {
    id: "user-research",
    name: "User Research",
    bgClass: "bg-[#E63968] text-white",
    textClass: "text-white font-semibold",
    iconBgClass: "bg-[#E63968]",
    icon: <Search className="w-4 h-4 text-white" />,
    rotation: "rotate-1",
  },
  {
    id: "motion-design",
    name: "Motion Design",
    bgClass: "bg-[#2563EB] text-white",
    textClass: "text-white font-semibold",
    iconBgClass: "bg-[#2563EB]",
    icon: <Quote className="w-4 h-4 text-white fill-white" />,
    rotation: "-rotate-1",
  },
];

export const AboutMeSection: React.FC = () => {
  const [hoveredPolaroid, setHoveredPolaroid] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftPolaroidRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const rightPolaroidRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Create master entrance timeline triggered on scroll enter
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      // 1. Top Header & Note Fade-in
      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      // 2. Left Polaroid Smooth Slide & Swing
      if (leftPolaroidRef.current) {
        tl.fromTo(
          leftPolaroidRef.current,
          { opacity: 0, x: -60, rotate: -12, scale: 0.9 },
          { opacity: 1, x: 0, rotate: -4, scale: 1, duration: 0.8, ease: "back.out(1.2)" },
          "-=0.4"
        );
      }

      // 3. Center Narrative Handwritten Story Reveal
      if (centerTextRef.current) {
        tl.fromTo(
          centerTextRef.current,
          { opacity: 0, y: 30, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power3.out" },
          "-=0.6"
        );
      }

      // 4. Right Polaroid Smooth Slide & Swing
      if (rightPolaroidRef.current) {
        tl.fromTo(
          rightPolaroidRef.current,
          { opacity: 0, x: 60, rotate: 12, scale: 0.9 },
          { opacity: 1, x: 0, rotate: 4, scale: 1, duration: 0.8, ease: "back.out(1.2)" },
          "-=0.65"
        );
      }

      // 5. Bottom Sketched Skill Stamps Pop In Staggered
      if (skillsRef.current) {
        const badges = skillsRef.current.querySelectorAll(".skill-badge-item");
        tl.fromTo(
          badges,
          { opacity: 0, scale: 0.75, y: 24 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.09,
            ease: "back.out(1.6)",
          },
          "-=0.4"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-me-section"
      className="relative w-full min-h-screen bg-transparent text-black flex flex-col justify-center items-center px-4 sm:px-8 py-20 sm:py-28 overflow-visible select-none"
      style={{ backgroundColor: "transparent" }}
    >

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Top Header / Corner Note Area */}
        <div
          ref={headerRef}
          className="w-full flex items-start justify-between mb-8 sm:mb-12 relative opacity-0"
        >
          {/* Top-Left Handwritten "about me!" */}
          <div className="flex items-center gap-1.5 -rotate-3 hover:rotate-0 transition-transform duration-300 cursor-default">
            <span
              className="text-2xl sm:text-3xl text-[#1a1a1a] tracking-wide"
              style={{
                fontFamily: "var(--font-caveat), cursive",
                fontWeight: 700,
              }}
            >
              about me!
            </span>
          </div>

          {/* Center Hand-Drawn "what's up" Badge */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0">
            <div className="relative inline-flex items-center justify-center px-6 py-2 transition-transform duration-300 hover:scale-105">
              {/* Organic Hand-Drawn Sketched Border SVG */}
              <svg
                viewBox="0 0 160 55"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full text-[#111111] overflow-visible pointer-events-none"
              >
                <path
                  d="M10 8 C40 5, 120 6, 150 9 C155 18, 153 38, 149 46 C120 49, 45 47, 11 48 C7 38, 6 18, 10 8 Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90"
                />
              </svg>

              <span
                className="text-2xl sm:text-[1.85rem] text-[#111111] relative z-10 select-none tracking-wide"
                style={{
                  fontFamily: "var(--font-caveat), cursive",
                  fontWeight: 700,
                }}
              >
                what&apos;s up
              </span>
            </div>
          </div>

          {/* Empty right balance spacer */}
          <div className="w-12 h-4 hidden sm:block" />
        </div>

        {/* Center Stage: Left Polaroid | Center Handwritten Story | Right Polaroid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center my-4 sm:my-8">
          
          {/* ──────── 1. Left Polaroid Photo ("me") ──────── */}
          <div className="lg:col-span-3 flex justify-center order-2 lg:order-1">
            <div
              ref={leftPolaroidRef}
              onMouseEnter={() => setHoveredPolaroid("me")}
              onMouseLeave={() => setHoveredPolaroid(null)}
              className={`relative bg-white p-3.5 pb-4 rounded-[4px] shadow-[0_16px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.06] opacity-0 transition-all duration-500 ease-out cursor-pointer ${
                hoveredPolaroid === "me"
                  ? "!rotate-0 scale-105 shadow-[0_24px_48px_rgba(0,0,0,0.16)] -translate-y-2 z-20"
                  : "scale-100 z-10"
              }`}
              style={{
                width: "210px",
                transformOrigin: "center center",
              }}
            >
              {/* Top-Left Purple/Blue Washi Tape */}
              <div
                className="absolute -top-3 -left-3 w-12 h-6 bg-[#9db4ff]/80 backdrop-blur-[0.5px] -rotate-[38deg] shadow-sm pointer-events-none rounded-[1px] border border-white/20"
                style={{
                  clipPath:
                    "polygon(0% 10%, 100% 0%, 95% 90%, 5% 100%, 0% 80%)",
                }}
              />

              {/* Top-Right Yellow/Peach Washi Tape */}
              <div
                className="absolute -top-2.5 -right-2.5 w-10 h-5 bg-[#ffe380]/85 backdrop-blur-[0.5px] rotate-[28deg] shadow-sm pointer-events-none rounded-[1px] border border-white/20"
                style={{
                  clipPath:
                    "polygon(4% 0%, 96% 8%, 100% 92%, 0% 100%)",
                }}
              />

              {/* Photo Viewport */}
              <div className="w-full aspect-[4/5] bg-[#f2ede6] rounded-[2px] overflow-hidden relative border border-black/5 shadow-inner">
                <img
                  src="/assets/gg_human.png"
                  alt="Ganesh - Me"
                  className="w-full h-full object-cover object-top filter contrast-[1.03] brightness-[1.02] transition-transform duration-700 hover:scale-105"
                />
                {/* Subtle vintage photo grain/vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Polaroid Bottom Handwritten Label */}
              <div className="w-full pt-2.5 text-center">
                <span
                  className="text-lg text-[#333333] tracking-wide"
                  style={{
                    fontFamily: "var(--font-caveat), cursive",
                    fontWeight: 600,
                  }}
                >
                  me :)
                </span>
              </div>
            </div>
          </div>

          {/* ──────── 2. Center Handwritten Main Story ──────── */}
          <div
            ref={centerTextRef}
            className="lg:col-span-6 flex flex-col items-center text-center px-2 sm:px-4 order-1 lg:order-2 opacity-0"
          >
            <p
              className="text-2xl sm:text-3xl md:text-[2.15rem] lg:text-[2.25rem] text-[#1a1a1a] leading-[1.38] tracking-[-0.01em] max-w-xl mx-auto transition-colors duration-300"
              style={{
                fontFamily: "var(--font-caveat), cursive",
                fontWeight: 600,
              }}
            >
              I&apos;m a product designer who gets a little too excited about making complicated things feel simple.{" "}
              <span className="inline-block transform hover:scale-125 transition-transform duration-200">✨</span>{" "}
              I care about the small details, the edge cases everyone forgets, and shipping work that genuinely makes someone&apos;s day easier.{" "}
              <span className="inline-block transform hover:scale-125 transition-transform duration-200">🎨</span>
            </p>
          </div>

          {/* ──────── 3. Right Polaroid Photo ("my workstation") ──────── */}
          <div className="lg:col-span-3 flex justify-center order-3">
            <div
              ref={rightPolaroidRef}
              onMouseEnter={() => setHoveredPolaroid("workstation")}
              onMouseLeave={() => setHoveredPolaroid(null)}
              className={`relative bg-white p-3.5 pb-4 rounded-[4px] shadow-[0_16px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.06] opacity-0 transition-all duration-500 ease-out cursor-pointer ${
                hoveredPolaroid === "workstation"
                  ? "!rotate-0 scale-105 shadow-[0_24px_48px_rgba(0,0,0,0.16)] -translate-y-2 z-20"
                  : "scale-100 z-10"
              }`}
              style={{
                width: "230px",
                transformOrigin: "center center",
              }}
            >
              {/* Top-Left Blue/Lilac Washi Tape */}
              <div
                className="absolute -top-3 -left-3 w-12 h-6 bg-[#9db4ff]/80 backdrop-blur-[0.5px] -rotate-[32deg] shadow-sm pointer-events-none rounded-[1px] border border-white/20"
                style={{
                  clipPath:
                    "polygon(5% 0%, 95% 10%, 100% 88%, 0% 100%)",
                }}
              />

              {/* Top-Right Light Yellow Washi Tape */}
              <div
                className="absolute -top-2.5 -right-2.5 w-11 h-5 bg-[#ffe380]/85 backdrop-blur-[0.5px] rotate-[34deg] shadow-sm pointer-events-none rounded-[1px] border border-white/20"
                style={{
                  clipPath:
                    "polygon(0% 8%, 100% 0%, 96% 92%, 4% 100%)",
                }}
              />

              {/* Photo Viewport */}
              <div className="w-full aspect-[4/3] bg-[#1a2e26] rounded-[2px] overflow-hidden relative border border-black/5 shadow-inner">
                <img
                  src="/assets/hero_room_setup.png"
                  alt="My Workstation"
                  className="w-full h-full object-cover object-center filter contrast-[1.04] brightness-[1.0] transition-transform duration-700 hover:scale-105"
                />
                {/* Vintage overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Polaroid Bottom Handwritten Label */}
              <div className="w-full pt-2.5 text-center">
                <span
                  className="text-lg text-[#333333] tracking-wide"
                  style={{
                    fontFamily: "var(--font-caveat), cursive",
                    fontWeight: 600,
                  }}
                >
                  my workstation
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ──────── Bottom Sketched Postage-Stamp Skill Tags ──────── */}
        <div
          ref={skillsRef}
          className="mt-8 sm:mt-12 flex flex-col items-center gap-3.5 z-10"
        >
          
          {/* Row 1: Interaction Design (Yellow) + Prototyping (Green) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {/* 1. Interaction Design Badge */}
            <div
              onClick={() => setActiveSkill(activeSkill === "interaction-design" ? null : "interaction-design")}
              className="skill-badge-item opacity-0 group relative inline-flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Main Pill Stamp */}
              <div className="px-5 py-2 rounded-[8px] bg-[#F4B223] text-[#1c1404] shadow-[0_4px_12px_rgba(244,178,35,0.25)] flex items-center justify-center font-sans text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] relative overflow-hidden transition-all duration-200 group-hover:brightness-105">
                <span
                  style={{
                    fontFamily: "var(--font-sora), sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Interaction Design
                </span>
              </div>

              {/* Square Icon Stamp Companion */}
              <div className="w-10 h-10 rounded-[8px] bg-[#F4B223] flex items-center justify-center text-[#1c1404] shadow-[0_4px_12px_rgba(244,178,35,0.25)] transition-all duration-200 group-hover:rotate-12 group-hover:brightness-105">
                <Sparkles className="w-5 h-5" strokeWidth={2.2} />
              </div>
            </div>

            {/* 2. Prototyping Badge */}
            <div
              onClick={() => setActiveSkill(activeSkill === "prototyping" ? null : "prototyping")}
              className="skill-badge-item opacity-0 group relative inline-flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Main Pill Stamp */}
              <div className="px-5 py-2 rounded-[8px] bg-[#10B981] text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] flex items-center justify-center font-sans text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] relative overflow-hidden transition-all duration-200 group-hover:brightness-105">
                <span
                  style={{
                    fontFamily: "var(--font-sora), sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Prototyping
                </span>
              </div>

              {/* Square Icon Stamp Companion */}
              <div className="w-10 h-10 rounded-[8px] bg-[#10B981] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all duration-200 group-hover:-rotate-12 group-hover:brightness-105">
                <Zap className="w-5 h-5 fill-white" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {/* Row 2: User Research (Pink) + Motion Design (Blue) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {/* 3. User Research Badge */}
            <div
              onClick={() => setActiveSkill(activeSkill === "user-research" ? null : "user-research")}
              className="skill-badge-item opacity-0 group relative inline-flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Main Pill Stamp */}
              <div className="px-5 py-2 rounded-[8px] bg-[#F43F5E] text-white shadow-[0_4px_12px_rgba(244,63,94,0.25)] flex items-center justify-center font-sans text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] relative overflow-hidden transition-all duration-200 group-hover:brightness-105">
                <span
                  style={{
                    fontFamily: "var(--font-sora), sans-serif",
                    fontWeight: 600,
                  }}
                >
                  User Research
                </span>
              </div>

              {/* Square Icon Stamp Companion */}
              <div className="w-10 h-10 rounded-[8px] bg-[#F43F5E] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(244,63,94,0.25)] transition-all duration-200 group-hover:rotate-12 group-hover:brightness-105">
                <Search className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>

            {/* 4. Motion Design Badge */}
            <div
              onClick={() => setActiveSkill(activeSkill === "motion-design" ? null : "motion-design")}
              className="skill-badge-item opacity-0 group relative inline-flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Main Pill Stamp */}
              <div className="px-5 py-2 rounded-[8px] bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] flex items-center justify-center font-sans text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] relative overflow-hidden transition-all duration-200 group-hover:brightness-105">
                <span
                  style={{
                    fontFamily: "var(--font-sora), sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Motion Design
                </span>
              </div>

              {/* Square Icon Stamp Companion */}
              <div className="w-10 h-10 rounded-[8px] bg-[#2563EB] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all duration-200 group-hover:-rotate-12 group-hover:brightness-105">
                <Quote className="w-5 h-5 fill-white" strokeWidth={2.2} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
