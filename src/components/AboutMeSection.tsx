"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const AboutMeSection: React.FC = () => {
  const [hoveredPolaroid, setHoveredPolaroid] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftPolaroidRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const textParagraphRef = useRef<HTMLParagraphElement>(null);
  const rightPolaroidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Create master entrance timeline triggered on scroll enter
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none reverse",
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

      // 3. Center Narrative Container Fade & Rise
      if (centerTextRef.current) {
        tl.fromTo(
          centerTextRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
          "-=0.5"
        );
      }

      // 3b. Line-by-Line Muted Text-Fill with 50% Hard-Stop Linear Gradient
      if (centerTextRef.current) {
        // Apply 50% hard-stop gradient to black text items
        const blackItems = centerTextRef.current.querySelectorAll(
          ".fill-line-1, .fill-line-2, .fill-line-3, .fill-line-4, .fill-line-5, .fill-line-6, .fill-line-7, .fill-line-8-black"
        );
        gsap.set(blackItems, {
          backgroundImage: "linear-gradient(to right, #000000 50%, #c0c4cc 50%)",
          backgroundSize: "200% 100%",
          backgroundPositionX: "100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          display: "inline-block",
        });

        // Apply 50% hard-stop gradient to blue text item ("AI and vibe coding.")
        const blueItem = centerTextRef.current.querySelector(".fill-line-8-blue");
        if (blueItem) {
          gsap.set(blueItem, {
            backgroundImage: "linear-gradient(to right, #2563EB 50%, #93c5fd 50%)",
            backgroundSize: "200% 100%",
            backgroundPositionX: "100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            display: "inline-block",
          });
        }

        // Sequential line-by-line ScrollTrigger timeline (anchored stably to section)
        const lineTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 55%",
            end: "center 35%",
            scrub: 0.6,
          },
        });

        // Line 1
        lineTl.to(".fill-line-1", { backgroundPositionX: "0%", ease: "none", duration: 0.9 });
        // Line 2
        lineTl.to(".fill-line-2", { backgroundPositionX: "0%", ease: "none", duration: 0.9 });
        // Line 3 + Highlighter 1 + Yellow spark
        lineTl.to(".fill-line-3", { backgroundPositionX: "0%", ease: "none", duration: 1 });
        lineTl.to(".highlighter-line-1", { scaleX: 1, ease: "power1.out", duration: 0.5 }, "<0.4");
        lineTl.to(".spark-yellow", { opacity: 1, scale: 1, ease: "back.out(2)", duration: 0.4 }, "<0.4");
        // Line 4 + Highlighter 2
        lineTl.to(".fill-line-4", { backgroundPositionX: "0%", ease: "none", duration: 0.8 });
        lineTl.to(".highlighter-line-2", { scaleX: 1, ease: "power1.out", duration: 0.5 }, "<0.3");
        // Line 5
        lineTl.to(".fill-line-5", { backgroundPositionX: "0%", ease: "none", duration: 0.9 });
        // Line 6
        lineTl.to(".fill-line-6", { backgroundPositionX: "0%", ease: "none", duration: 0.9 });
        // Line 7
        lineTl.to(".fill-line-7", { backgroundPositionX: "0%", ease: "none", duration: 0.9 });
        // Line 8 (powered by + AI and vibe coding.) + Blue spark
        lineTl.to(".fill-line-8-black", { backgroundPositionX: "0%", ease: "none", duration: 0.4 });
        lineTl.to(".fill-line-8-blue", { backgroundPositionX: "0%", ease: "none", duration: 0.8 }, "<0.2");
        lineTl.to(".spark-blue", { opacity: 1, scale: 1, ease: "back.out(2)", duration: 0.4 }, "<0.4");
      }

      // 4. Stuff Box Physical Slide & 90-Degree Rotate Entrance
      if (rightPolaroidRef.current) {
        tl.fromTo(
          rightPolaroidRef.current,
          {
            opacity: 0,
            x: 360,
            y: 40,
            rotate: 90,
            scale: 0.9,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 1.25,
            ease: "power3.out",
          },
          "-=0.55"
        );
      }


    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-me-section"
      className="relative w-full min-h-screen bg-transparent text-black flex flex-col justify-center items-center px-4 sm:px-8 pt-20 sm:pt-28 pb-36 sm:pb-48 overflow-visible select-none"
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

          {/* ──────── 2. Center Narrative Story with Graphic Highlights ──────── */}
          <div
            ref={centerTextRef}
            className="lg:col-span-6 flex flex-col items-center px-2 sm:px-4 order-1 lg:order-2 will-change-transform opacity-0 select-none text-center"
            style={{
              fontFamily: "var(--font-sora), sans-serif",
            }}
          >
            <div className="flex flex-col items-center gap-4 sm:gap-5 max-w-xl mx-auto w-full">
              {/* Block 1: Intro */}
              <div className="text-base sm:text-lg md:text-[1.22rem] font-normal leading-[1.65] text-center w-full">
                <span className="block fill-line-item fill-line-1">An M.Com graduate who took a detour</span>
                <span className="block fill-line-item fill-line-2">into design — and never looked back.</span>
              </div>

              {/* Block 2: Career Path with Yellow Highlighters & Spark */}
              <div className="relative inline-flex flex-col items-center my-1">
                {/* Yellow Hand-Drawn Doodle Rays (Top-Right) */}
                <div className="spark-yellow absolute -top-3.5 -right-6 sm:-right-8 pointer-events-none opacity-0 scale-50 transition-all">
                  <svg
                    className="w-5 h-5 text-[#F59E0B]"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="4" y1="5" x2="16" y2="1.5" />
                    <line x1="3" y1="10" x2="17" y2="10" />
                    <line x1="4" y1="15" x2="16" y2="18.5" />
                  </svg>
                </div>

                <div className="text-base sm:text-[1.2rem] md:text-[1.32rem] font-bold tracking-tight text-center leading-[1.5]">
                  {/* Line 3 with Highlighter */}
                  <div className="relative inline-block px-1">
                    <span className="relative z-10 fill-line-item fill-line-3">Graphic Designer → UI/UX Designer →</span>
                    <span className="highlighter-line-1 absolute -bottom-0.5 left-0 right-0 h-[6px] sm:h-[7px] bg-[#FDE047]/90 rounded-full z-0 origin-left scale-x-0 transition-transform" />
                  </div>

                  {/* Line 4 with Highlighter */}
                  <div className="relative inline-block px-1 mt-1">
                    <span className="relative z-10 fill-line-item fill-line-4">Team Lead at Webnox.</span>
                    <span className="highlighter-line-2 absolute -bottom-0.5 left-0 right-0 h-[6px] sm:h-[7px] bg-[#FDE047]/90 rounded-full z-0 origin-left scale-x-0 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Block 3: Philosophy */}
              <div className="text-base sm:text-lg md:text-[1.22rem] font-normal leading-[1.65] text-center w-full">
                <span className="block fill-line-item fill-line-5">Every step taught me something new,</span>
                <span className="block fill-line-item fill-line-6">and every project shaped the designer I am today.</span>
              </div>

              {/* Block 4: Closer with Blue Accent & Spark */}
              <div className="text-base sm:text-lg md:text-[1.22rem] font-normal leading-[1.65] text-center w-full">
                <span className="block fill-line-item fill-line-7">This portfolio? Built from that journey —</span>
                <span className="relative inline-flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="fill-line-item fill-line-8-black">powered by</span>
                  <span className="fill-line-item fill-line-8-blue font-bold text-[#2563EB]">AI and vibe coding.</span>
                  {/* Blue Hand-Drawn Doodle Rays (Bottom-Right) */}
                  <span className="spark-blue absolute -bottom-2 -right-6 sm:-right-7 pointer-events-none opacity-0 scale-50 transition-all inline-block">
                    <svg
                      className="w-4 h-4 text-[#2563EB]"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="4" y1="5" x2="16" y2="1.5" />
                      <line x1="3" y1="10" x2="17" y2="10" />
                      <line x1="4" y1="15" x2="16" y2="18.5" />
                    </svg>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* ──────── 3. Right Object ("my stuffs" box) ──────── */}
          <div className="lg:col-span-3 flex justify-center order-3">
            <div
              ref={rightPolaroidRef}
              className="relative opacity-0 will-change-transform"
              style={{
                width: "290px",
                maxWidth: "100%",
                transformOrigin: "center center",
              }}
            >
              <div
                className="group relative cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 drop-shadow-[0_16px_28px_rgba(0,0,0,0.15)] hover:drop-shadow-[0_26px_40px_rgba(0,0,0,0.22)]"
              >
                <img
                  src="/assets/stuff_box.png"
                  alt="My Stuffs"
                  className="w-full h-auto object-contain select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

        </div>


      </div>
    </section>
  );
};
