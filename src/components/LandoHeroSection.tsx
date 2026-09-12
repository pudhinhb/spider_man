"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Volume2, VolumeX } from "lucide-react";
import { soundManager } from "@/lib/sound";
import { FluidBgCanvas } from "@/components/FluidBgCanvas";
import { FluidSpideyCanvas } from "@/components/FluidSpideyCanvas";
import SideRays from "@/components/SideRays";

export const LandoHeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const portraitStageRef = useRef<HTMLDivElement>(null);
  const skeletonBaseRef = useRef<HTMLDivElement>(null);
  const skeletonScanRef = useRef<HTMLDivElement>(null);

  const [soundOn, setSoundOn] = useState(true);

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.enabled = next;
    if (next) soundManager.playHudBeep(1200);
  };

  // GSAP Choreography & Continuous Top-to-Bottom Face Scanning Animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // 1. Entrance Animation for Title & Full-Screen Stage
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        logoRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2 }
      ).fromTo(
        portraitStageRef.current,
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: "power4.out" },
        "-=0.9"
      );

      // 2. CONTINUOUS TOP-TO-BOTTOM FACE SCANNING ANIMATION WITH SMOOTH FADE-IN & FADE-OUT
      // Dynamically calculate the face position based on screen aspect ratio
      const scanTl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });

      const scanObj = { progress: 0 };
      scanTl.to(scanObj, {
        progress: 100,
        duration: 2.8,
        onUpdate: () => {
          const p = scanObj.progress;
          const { innerWidth, innerHeight } = window;
          const canvasRatio = innerWidth / innerHeight;
          const imgRatio = 1131 / 1391; // ~0.813

          // Calculate exact face position relative to screen height
          let faceStart = 10;
          let faceEnd = 55;
          if (canvasRatio < imgRatio) {
            // Mobile portrait: bottom-aligned image height is proportionate to width
            const imgHeightPercent = (canvasRatio / imgRatio) * 100;
            const imgTopPercent = 100 - imgHeightPercent;
            faceStart = imgTopPercent + imgHeightPercent * 0.10;
            faceEnd = imgTopPercent + imgHeightPercent * 0.55;
          }

          const topPercent = faceStart + (p / 100) * (faceEnd - faceStart);

          // Smooth sinusoidal fade-in and fade-out at top and bottom extremes
          const edgeFade = Math.sin((p / 100) * Math.PI);
          const scanOpacity = Math.pow(edgeFade, 0.45); // Eased curve: stays bright across face, smoothly fades at edges

          // Soft 2D Elliptical Radial Gradient Mask (Eliminates all rectangular/square edges completely!)
          if (skeletonScanRef.current) {
            skeletonScanRef.current.style.opacity = `${scanOpacity}`;
            const ellipticalMask = `radial-gradient(ellipse 46% 14% at 50% ${topPercent}%, black 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 68%, transparent 100%)`;
            skeletonScanRef.current.style.webkitMaskImage = ellipticalMask;
            skeletonScanRef.current.style.maskImage = ellipticalMask;
          }
        },
      });

      // 3. Subtle Parallax 3D Tilt on Mouse Movement
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const xPercent = (e.clientX / innerWidth - 0.5) * 2;
        const yPercent = (e.clientY / innerHeight - 0.5) * 2;

        if (portraitStageRef.current) {
          gsap.to(portraitStageRef.current, {
            rotationY: xPercent * 3,
            rotationX: -yPercent * 2.5,
            x: xPercent * 8,
            y: yPercent * 6,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen min-h-screen flex flex-col justify-between overflow-hidden bg-black text-white select-none"
    >
      {/* ========================================================================= */}
      {/* 1. FULL-SCREEN BACKGROUND (Fluid Cursor-Revealed Spider Web BG + SideRays) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
        {/* Dynamic Fluid Ghost Smoke Background Canvas (Reveals Spider Web texture on mouse motion) */}
        <FluidBgCanvas
          imageSrc="/assets/bg_web.png"
          baseOpacity={0.015}
          revealOpacity={0.4}
        />

        {/* Dynamic WebGL SideRays Shine Effect (Pure Crystal White Shiner Rays, Zero BG Color Tint) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-1">
          <SideRays
            speed={2.2}
            rayColor1="#ffffff"
            rayColor2="#ffffff"
            intensity={1.8}
            spread={2.0}
            origin="top-right"
            tilt={0}
            saturation={0}
            blend={0.5}
            falloff={1.6}
            opacity={0.85}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP HEADER (ONLY TITLE) */}
      {/* ========================================================================= */}
      <header className="relative z-30 w-full px-5 sm:px-10 lg:px-14 pt-5 sm:pt-8 flex items-start justify-between pointer-events-auto">
        {/* Bold GG Logo with dot + Increased Still... Graphic */}
        <div
          ref={logoRef}
          className="cursor-pointer group flex flex-col items-start"
          onClick={() => soundManager.playThwip()}
        >
          <div className="flex items-baseline gap-1">
            <Image
              src="/assets/gg_logo.png"
              alt="GG Logo"
              width={320}
              height={160}
              priority
              className="w-24 sm:w-36 lg:w-48 h-auto object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(0,240,255,0.6)] group-hover:scale-105 transition-all duration-300"
            />
            <span className="text-red-500 font-editorial font-black text-3xl sm:text-5xl lg:text-6xl leading-none drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
              .
            </span>
          </div>

          <div className="mt-2 sm:mt-3">
            <Image
              src="/assets/still.png"
              alt="Still..."
              width={340}
              height={114}
              priority
              className="w-32 sm:w-48 lg:w-60 h-auto object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] drop-shadow-[0_0_15px_rgba(255,255,255,0.18)] group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all duration-300"
            />
          </div>
        </div>

        {/* Minimalist Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-white/15 flex items-center justify-center text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-all duration-200 bg-black/40 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95"
          title={soundOn ? "Audio: ON" : "Audio: MUTED"}
        >
          {soundOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50" />}
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 3. FULL-SCREEN 3-LAYER INTERACTIVE COMPOSITION (BOTTOM-ANCHORED HERO STAGE) */}
      {/* - Layer 1 & 2: Human Developer Portrait & Fluid Ghost Spider-Man Suit Reveal */}
      {/* - Layer 3: Cyan Holographic Skeleton Blueprint with continuous face scan */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-auto z-10 perspective-1000">
        <div
          ref={portraitStageRef}
          className="relative w-full h-full flex items-end justify-center preserve-3d"
        >

          {/* LAYER 1 & 2: DYNAMIC HUMAN DEVELOPER PORTRAIT & SPIDER-MAN SUIT REVEAL */}
          {/* - Base: GG no background.png */}
          {/* - Reveal: GGSpidey no backgound.png through organic fluid ghost smoke */}
          {/* - When revealed, the human image is dynamically erased underneath */}
          <FluidSpideyCanvas
            humanImageSrc="/assets/gg_human.png"
            spideyImageSrc="/assets/gg_spidey.png"
            className="z-10"
          />

          {/* LAYER 3: SKELETON BLUEPRINT WITH CONTINUOUS TOP-TO-BOTTOM SCANNING */}
          {/* - Soft 2D Elliptical feathered gradient mask with FADE-IN & FADE-OUT */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex items-end justify-center">
            {/* 3A: Ambient Ghost Skeleton Blueprint (Ultra Low Opacity: ~0.03) */}
            <div
              ref={skeletonBaseRef}
              className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-screen"
            >
              <Image
                src="/assets/mask_blueprint.png"
                alt="Skeleton Wireframe Ambient"
                fill
                priority
                className="object-contain object-bottom filter brightness-90"
              />
            </div>

            {/* 3B: High-Intensity Active Scanning Band (Soft 2D Elliptical Radial Mask with Fade In & Out) */}
            <div
              ref={skeletonScanRef}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-100 transition-all duration-75"
            >
              <Image
                src="/assets/mask_blueprint.png"
                alt="Skeleton Wireframe Active Scan"
                fill
                priority
                className="object-contain object-bottom filter brightness-150 drop-shadow-[0_0_20px_#00f0ff] drop-shadow-[0_0_35px_#00f0ff]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Area */}
      <footer className="relative z-30 w-full px-5 sm:px-10 lg:px-14 pb-5 sm:pb-6 flex items-end justify-between pointer-events-none">
        <div className="text-[9px] sm:text-[10px] font-mono text-zinc-500 tracking-wider">
          EST. 2026 // SPIDER-VERSE
        </div>

        {/* Bottom Right "TO BE CONTINUED" Badge */}
        <div
          className="pointer-events-auto cursor-pointer group flex items-center justify-end"
          onClick={() => soundManager.playThwip()}
        >
          <Image
            src="/assets/to_be_continued.png"
            alt="To Be Continued"
            width={240}
            height={86}
            priority
            className="w-28 sm:w-40 lg:w-52 h-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all duration-300"
          />
        </div>
      </footer>
    </div>
  );
};
