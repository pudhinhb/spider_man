"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  Layers,
  Cpu,
  Terminal,
  Compass,
  Code2,
  Scan,
  Maximize2,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { SpiderWebCorner } from "./SpiderWebCorner";
import { soundManager } from "@/lib/sound";

// Register ScrollTrigger once on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type RevealMode = "lens" | "blueprint" | "split" | "suit";

const TECH_PILLS = [
  { name: "Next.js 15 (App Router)", icon: "⚛️", role: "Web Weaver" },
  { name: "TypeScript & React", icon: "⚡", role: "Spider DNA" },
  { name: "GSAP & WebGL Motion", icon: "🕸️", role: "Agile Kinetics" },
  { name: "Tailwind CSS & Canvas", icon: "🎨", role: "Suit Architecture" },
  { name: "Node.js & Distributed APIs", icon: "🛡️", role: "Web Infrastructure" },
  { name: "AI Agent Orchestration", icon: "🧠", role: "Spider-Sense Logic" },
];

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftWebRef = useRef<HTMLDivElement>(null);
  const rightWebRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLHeadingElement>(null);
  const headingLine2Ref = useRef<HTMLHeadingElement>(null);
  const descContainerRef = useRef<HTMLDivElement>(null);
  const portraitContainerRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const heroImageStageRef = useRef<HTMLDivElement>(null);
  const radarScanlineRef = useRef<HTMLDivElement>(null);

  // Interactive Reveal State
  const [revealMode, setRevealMode] = useState<RevealMode>("lens");
  const [lensRadius, setLensRadius] = useState<number>(140);
  const [mousePos, setMousePos] = useState({ x: 50, y: 45 }); // percent or px
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isSuitActive, setIsSuitActive] = useState(false);
  const [isHoveringPortrait, setIsHoveringPortrait] = useState(false);
  const [spiderSenseAlert, setSpiderSenseAlert] = useState(false);

  // Handle stage mouse move for dynamic mask
  const handleStageMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!heroImageStageRef.current) return;
      const rect = heroImageStageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });

      if (revealMode === "split") {
        setSplitPos(Math.max(5, Math.min(95, x)));
      }
    },
    [revealMode]
  );

  // Handle touch for mobile devices
  const handleStageTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!heroImageStageRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = heroImageStageRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
      if (revealMode === "split") {
        setSplitPos(Math.max(5, Math.min(95, x)));
      }
    },
    [revealMode]
  );

  // Trigger Spider-Sense Web Surge
  const triggerSpiderSense = () => {
    soundManager.playSpiderSense();
    setSpiderSenseAlert(true);
    setTimeout(() => setSpiderSenseAlert(false), 1200);

    if (heroImageStageRef.current) {
      gsap.fromTo(
        heroImageStageRef.current,
        { scale: 0.98, filter: "brightness(1.5) drop-shadow(0 0 35px #e22227)" },
        { scale: 1, filter: "brightness(1) drop-shadow(0 0 0px transparent)", duration: 0.8, ease: "elastic.out(1, 0.4)" }
      );
    }
  };

  // Toggle Full Suit Mode
  const toggleSuitMode = () => {
    const nextSuit = !isSuitActive;
    setIsSuitActive(nextSuit);
    if (nextSuit) {
      setRevealMode("suit");
      soundManager.playSuitPower();
    } else {
      setRevealMode("lens");
      soundManager.playThwip();
    }
  };

  // Setup GSAP Choreography
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // 1. Master Entrance Timeline
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.2,
      });

      // Background webs drop with elastic physics
      if (leftWebRef.current && rightWebRef.current) {
        tl.fromTo(
          [leftWebRef.current, rightWebRef.current],
          { y: -180, opacity: 0, scale: 0.8 },
          { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: "elastic.out(1, 0.5)", stagger: 0.15 }
        );
      }

      // Eyebrow badge slide with clip-path
      if (eyebrowRef.current) {
        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, x: -50, clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" },
          { opacity: 1, x: 0, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 0.8 },
          "-=0.9"
        );
      }

      // Main Heading Staggered Rise with clip-path
      if (headingLine1Ref.current && headingLine2Ref.current) {
        tl.fromTo(
          [headingLine1Ref.current, headingLine2Ref.current],
          { y: 70, opacity: 0, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
          { y: 0, opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1, stagger: 0.15, ease: "power4.out" },
          "-=0.6"
        );
      }

      // Central Portrait Dropping from Ceiling Thread
      if (portraitContainerRef.current) {
        tl.fromTo(
          portraitContainerRef.current,
          { y: -500, opacity: 0, scale: 0.85 },
          { y: 0, opacity: 1, scale: 1, duration: 1.6, ease: "elastic.out(1.1, 0.45)" },
          "-=0.9"
        );
      }

      // Paragraph 3D Reveal with rotationX & perspective
      if (descContainerRef.current) {
        const paragraphs = descContainerRef.current.querySelectorAll("p, .stat-card");
        tl.fromTo(
          paragraphs,
          { y: 35, opacity: 0, rotationX: -40, transformOrigin: "bottom center" },
          { y: 0, opacity: 1, rotationX: 0, duration: 0.85, stagger: 0.12, ease: "back.out(1.4)" },
          "-=1"
        );
      }

      // Tech Stack Pills Staggered Pop
      if (pillsRef.current) {
        const pills = pillsRef.current.children;
        tl.fromTo(
          pills,
          { scale: 0.4, opacity: 0, y: 25 },
          { scale: 1, opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "back.out(2)" },
          "-=0.7"
        );
      }

      // CTA Group Reveal
      if (ctaGroupRef.current) {
        tl.fromTo(
          ctaGroupRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.5"
        );
      }

      // 2. CONTINUOUS AMBIENT ANIMATIONS (Independent infinite tweens)

      // Ambient Swinging of Corner Webs
      if (leftWebRef.current) {
        gsap.to(leftWebRef.current, {
          rotation: 3,
          transformOrigin: "top left",
          duration: 4.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
      if (rightWebRef.current) {
        gsap.to(rightWebRef.current, {
          rotation: -3,
          transformOrigin: "top right",
          duration: 5.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.5,
        });
      }

      // Subtle Hanging Portrait Continuous Pendulum Swing
      if (portraitContainerRef.current) {
        gsap.to(portraitContainerRef.current, {
          rotation: 1.2,
          transformOrigin: "top center",
          duration: 6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Floating Tech Pills Micro-Physics
      if (pillsRef.current) {
        Array.from(pillsRef.current.children).forEach((pill, idx) => {
          const duration = 2.8 + (idx % 3) * 0.7;
          const yOffset = (idx % 2 === 0 ? 1 : -1) * (5 + (idx % 3) * 3);
          gsap.to(pill, {
            y: `+=${yOffset}`,
            duration,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: idx * 0.2,
          });
        });
      }

      // 3D Parallax Tilt on Mouse Movement over Container
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPercent = (clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (clientY / window.innerHeight - 0.5) * 2;

        if (headingLine1Ref.current && headingLine2Ref.current) {
          gsap.to([headingLine1Ref.current, headingLine2Ref.current], {
            x: xPercent * 12,
            y: yPercent * 8,
            rotationY: xPercent * 4,
            rotationX: -yPercent * 4,
            duration: 0.6,
            ease: "power1.out",
            overwrite: "auto",
          });
        }

        if (portraitContainerRef.current) {
          gsap.to(portraitContainerRef.current, {
            x: xPercent * 8,
            y: yPercent * 6,
            duration: 0.8,
            ease: "power1.out",
            overwrite: "auto",
          });
        }
      };

      window.addEventListener("mousemove", handleGlobalMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen pt-20 pb-16 md:pt-28 md:pb-24 flex flex-col justify-center overflow-hidden spider-grid-pattern transition-colors duration-500 select-none"
    >
      {/* Spider-Sense Screen Alert Flash */}
      <div
        className={`fixed inset-0 pointer-events-none z-30 transition-opacity duration-300 ${spiderSenseAlert
            ? "opacity-100 bg-red-600/10 backdrop-blur-[1px] shadow-[inset_0_0_80px_rgba(226,34,39,0.5)]"
            : "opacity-0"
          }`}
      />

      {/* Hanging Top Corner Spider-Web Decals */}
      <div
        ref={leftWebRef}
        className="absolute top-0 left-0 z-10 pointer-events-none"
      >
        <SpiderWebCorner position="left" />
      </div>
      <div
        ref={rightWebRef}
        className="absolute top-0 right-0 z-10 pointer-events-none"
      >
        <SpiderWebCorner position="right" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">

        {/* TOP SECTION: EYEBROW & SPIDER BADGE */}
        <div
          ref={eyebrowRef}
          className="flex items-center gap-3 mb-4 md:mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 dark:bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase">
              GG // CREATIVE WEAVER
            </span>
          </div>

          <div className="h-[1px] w-16 bg-gradient-to-r from-red-500/50 to-transparent hidden sm:block" />

          <button
            onClick={triggerSpiderSense}
            data-cursor-hover
            className="group flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Click to test Spider-Sense intuition"
          >
            <Zap className="w-3.5 h-3.5 text-red-500 group-hover:animate-bounce" />
            <span className="underline decoration-dotted underline-offset-4">
              TEST SPIDER-SENSE
            </span>
          </button>
        </div>

        {/* TWO-COLUMN CINEMATIC COMPOSITION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN: EDITORIAL TYPOGRAPHY & BIO */}
          <div className="lg:col-span-7 flex flex-col justify-center perspective-1000">

            {/* Cinematic Large Headline with 3D Skew */}
            <div className="mb-6 preserve-3d">
              <h1
                ref={headingLine1Ref}
                className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-[0.95]"
              >
                ARCHITECTING
              </h1>
              <h1
                ref={headingLine2Ref}
                className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-rose-600 leading-[0.95] mt-1 flex flex-wrap items-center gap-3"
              >
                THE DIGITAL WEB
                <span className="inline-flex text-xs md:text-sm font-mono tracking-widest px-2.5 py-1 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 align-middle normal-case font-normal border border-red-500/40 shadow-sm">
                  PORTFOLIO &apos;26
                </span>
              </h1>
            </div>

            {/* 3D Paragraph Container */}
            <div ref={descContainerRef} className="space-y-4 max-w-2xl mb-8">
              <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed">
                By day, an engineer crafting resilient, scalable full-stack architectures.
                By night, a creative technologist weaving cinematic user experiences with <span className="font-semibold text-red-600 dark:text-red-400 underline decoration-red-500/40">pixel-perfect GSAP physics</span> and bleeding-edge web kinetics.
              </p>

              {/* Tactical Stats Micro-Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="stat-card p-3 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                  <div className="text-xl sm:text-2xl font-black text-red-600 font-mono">
                    50+
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase">
                    Web Projects
                  </div>
                </div>

                <div className="stat-card p-3 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                  <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-mono">
                    99.9%
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase">
                    Code Reflexes
                  </div>
                </div>

                <div className="stat-card p-3 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                  <div className="text-xl sm:text-2xl font-black text-cyan-500 font-mono">
                    60 FPS
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase">
                    Motion Kinetics
                  </div>
                </div>
              </div>
            </div>

            {/* TECHNOLOGY PILLS WITH STAGGERED REVEAL & FLOAT */}
            <div className="mb-8">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-red-500" />
                SUIT CAPABILITIES // TECH MATRIX
              </div>

              <div
                ref={pillsRef}
                className="flex flex-wrap gap-2 sm:gap-2.5"
              >
                {TECH_PILLS.map((pill, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => soundManager.playHudBeep(700 + idx * 80)}
                    data-cursor-hover
                    className="interactive-pill group relative px-3 py-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 hover:border-red-500/80 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-red-600/20 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-white transition-colors">
                      <span className="text-sm">{pill.icon}</span>
                      <span>{pill.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA ACTION BUTTONS */}
            <div
              ref={ctaGroupRef}
              className="flex flex-wrap items-center gap-4"
            >
              {/* Primary Sling Button */}
              <a
                href="#projects"
                onClick={() => soundManager.playThwip()}
                data-cursor-hover
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200 active:scale-95 overflow-hidden"
              >
                {/* Button shine sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
                <span>EXPLORE THE WEB</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              {/* Secondary Identity Switcher Button */}
              <button
                onClick={toggleSuitMode}
                data-cursor-hover
                className="group inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 transition-all duration-200 active:scale-95 shadow-sm"
              >
                <Layers className="w-4 h-4 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
                <span>{isSuitActive ? "DEACTIVATE SUIT" : "ACTIVATE SUIT"}</span>
              </button>

              {/* Sound / Mode micro helper */}
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 hidden sm:inline-block">
                ⚡ HOVER PORTRAIT TO REVEAL IDENTITY
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: SUSPENDED INTERACTIVE 3-LAYER SPIDER PORTRAIT */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">

            {/* Suspended Object Container */}
            <div
              ref={portraitContainerRef}
              className="relative flex flex-col items-center"
            >
              {/* Ceiling Spider Silk Thread */}
              <div
                ref={threadRef}
                className="w-[1.5px] h-12 sm:h-20 bg-gradient-to-b from-red-600 via-zinc-400 to-red-500 shadow-[0_0_8px_rgba(226,34,39,0.8)] relative"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-600" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              </div>

              {/* Circular Framed Interactive Stage */}
              <div className="relative group">

                {/* Pulsing Breathing Aura Glow */}
                <div
                  className={`absolute -inset-4 rounded-full transition-all duration-700 pointer-events-none blur-2xl ${isSuitActive
                      ? "bg-red-600/40 animate-spider-pulse"
                      : revealMode === "blueprint"
                        ? "bg-cyan-500/30"
                        : "bg-red-500/20 group-hover:bg-red-600/35"
                    }`}
                />

                {/* Tactical Corner HUD Brackets */}
                <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-red-500 pointer-events-none z-30" />
                <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-red-500 pointer-events-none z-30" />
                <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-red-500 pointer-events-none z-30" />
                <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-red-500 pointer-events-none z-30" />

                {/* PORTRAIT STAGE CONTAINER */}
                <div
                  ref={heroImageStageRef}
                  onMouseMove={handleStageMouseMove}
                  onTouchMove={handleStageTouchMove}
                  onMouseEnter={() => {
                    setIsHoveringPortrait(true);
                    soundManager.playHudBeep(950);
                  }}
                  onMouseLeave={() => setIsHoveringPortrait(false)}
                  className="hero-image-stage relative w-[290px] h-[340px] sm:w-[360px] sm:h-[420px] md:w-[410px] md:h-[470px] rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 shadow-2xl transition-transform duration-300 cursor-crosshair"
                  style={{
                    boxShadow: isHoveringPortrait
                      ? "0 20px 50px -10px rgba(226,34,39,0.35), 0 0 0 1px rgba(226,34,39,0.5)"
                      : "0 20px 40px -15px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* Background Hologram Mesh Lines */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#e22227_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* LAYER 1: BASE HUMAN DEVELOPER IMAGE (Peter Parker) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-filter duration-300">
                    <Image
                      src="/assets/gg_human.png"
                      alt="Developer (Peter Parker)"
                      fill
                      priority
                      className={`object-cover object-center transition-all duration-500 ${isHoveringPortrait
                          ? "grayscale-0 filter contrast-105"
                          : "grayscale contrast-110 opacity-95"
                        }`}
                    />
                  </div>

                  {/* LAYER 2: SPIDER-MAN MASK & SUIT (Revealed dynamically via Mouse Mask / Split / Suit Mode) */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      clipPath:
                        revealMode === "suit" || isSuitActive
                          ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                          : revealMode === "split"
                            ? `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`
                            : revealMode === "lens"
                              ? `circle(${isHoveringPortrait ? lensRadius : 70}px at ${mousePos.x}% ${mousePos.y}%)`
                              : "none",
                      opacity: revealMode === "blueprint" ? 0 : 1,
                    }}
                  >
                    <Image
                      src="/assets/gg_spidey.png"
                      alt="Spider-Man Suit"
                      fill
                      priority
                      className="object-cover object-center filter contrast-115 drop-shadow-[0_0_20px_rgba(226,34,39,0.5)]"
                    />

                    {/* Lens rim glow outline */}
                    {revealMode === "lens" && isHoveringPortrait && (
                      <div
                        className="absolute w-2 h-2 rounded-full border-2 border-red-500 shadow-[0_0_15px_#ff1e27] pointer-events-none"
                        style={{
                          left: `${mousePos.x}%`,
                          top: `${mousePos.y}%`,
                          transform: "translate(-50%, -50%)",
                          width: `${lensRadius * 2}px`,
                          height: `${lensRadius * 2}px`,
                        }}
                      />
                    )}
                  </div>

                  {/* LAYER 3: HOLOGRAPHIC BLUEPRINT WIREFRAME (Blueprint Mode) */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${revealMode === "blueprint" ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    <Image
                      src="/assets/mask_blueprint.png"
                      alt="Mask Blueprint Wireframe"
                      fill
                      priority
                      className="object-cover object-center filter brightness-125 drop-shadow-[0_0_25px_#00f0ff] mix-blend-screen"
                    />

                    {/* Radar Scanning Line */}
                    <div
                      ref={radarScanlineRef}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-[scanline_3s_linear_infinite]"
                    />
                  </div>

                  {/* INTERACTIVE HUD OVERLAY */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between pointer-events-none text-white">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400">
                        <Scan className="w-3 h-3 animate-spin" />
                        <span>DNA RECOGNITION: CONFIRMED</span>
                      </div>
                      <div className="text-xs font-mono font-bold tracking-wider">
                        {isSuitActive
                          ? "SPIDER-SUIT // ACTIVE"
                          : revealMode === "blueprint"
                            ? "HUD WIREFRAME // SCAN"
                            : "IDENTITY // PETER PARKER"}
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] text-zinc-400">
                      <div>COORD: {Math.round(mousePos.x)}:{Math.round(mousePos.y)}</div>
                      <div className="text-emerald-400">SENSE: 100%</div>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE REVEAL MODE SELECTOR BAR */}
                <div className="mt-4 flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-md">
                  <button
                    onClick={() => {
                      setRevealMode("lens");
                      setIsSuitActive(false);
                      soundManager.playHudBeep(800);
                    }}
                    data-cursor-hover
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1.5 ${revealMode === "lens" && !isSuitActive
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>LENS</span>
                  </button>

                  <button
                    onClick={() => {
                      setRevealMode("blueprint");
                      setIsSuitActive(false);
                      soundManager.playHudBeep(1100);
                    }}
                    data-cursor-hover
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1.5 ${revealMode === "blueprint"
                        ? "bg-cyan-500 text-black shadow-sm font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-cyan-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                  >
                    <Cpu className="w-3 h-3" />
                    <span>HUD WIREFRAME</span>
                  </button>

                  <button
                    onClick={() => {
                      setRevealMode("split");
                      setIsSuitActive(false);
                      soundManager.playHudBeep(900);
                    }}
                    data-cursor-hover
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1.5 ${revealMode === "split"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>SPLIT</span>
                  </button>

                  <button
                    onClick={toggleSuitMode}
                    data-cursor-hover
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1.5 ${isSuitActive
                        ? "bg-red-600 text-white shadow-md shadow-red-600/40"
                        : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                      }`}
                  >
                    <Flame className="w-3 h-3 text-red-500" />
                    <span>SUIT UP</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
