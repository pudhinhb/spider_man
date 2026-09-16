"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { soundManager } from "@/lib/sound";
import { FluidBgCanvas } from "@/components/FluidBgCanvas";
import { FluidSpideyCanvas } from "@/components/FluidSpideyCanvas";
import SideRays from "@/components/SideRays";

export const LandoHeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const portraitStageRef = useRef<HTMLDivElement>(null);
  const skeletonBaseRef = useRef<HTMLDivElement>(null);
  const skeletonScanRef = useRef<HTMLDivElement>(null);

  // GSAP Choreography & Continuous Top-to-Bottom Face Scanning Animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // 1. Entrance Animation for Full-Screen Stage
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        portraitStageRef.current,
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: "power4.out" }
      );

      // 2. CONTINUOUS TOP-TO-BOTTOM FACE SCANNING ANIMATION WITH SMOOTH FADE-IN & FADE-OUT
      // Organic elliptical radial mask sweeping from forehead (6%) to chin (58%)
      const scanTl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });

      const scanObj = { progress: 0 };
      scanTl.to(scanObj, {
        progress: 100,
        duration: 2.8,
        onUpdate: () => {
          const p = scanObj.progress;
          // Calculate vertical position across facial region (6% forehead to 58% chin)
          const topPercent = 6 + p * 0.52;

          // Smooth sinusoidal fade-in and fade-out at top and bottom extremes
          const edgeFade = Math.sin((p / 100) * Math.PI);
          const scanOpacity = Math.pow(edgeFade, 0.45); // Eased curve: stays bright across face, smoothly fades at edges

          // Soft 2D Elliptical Radial Gradient Mask centered over the face wireframe
          if (skeletonScanRef.current) {
            skeletonScanRef.current.style.opacity = `${scanOpacity}`;
            const ellipticalMask = `radial-gradient(ellipse 26% 12% at 51% ${topPercent}%, black 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.2) 70%, transparent 100%)`;
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
      {/* 3. FULL-SCREEN 3-LAYER INTERACTIVE COMPOSITION (BOTTOM-ANCHORED HERO STAGE) */}
      {/* - Layer 1 & 2: Human Developer Portrait & Fluid Ghost Spider-Man Suit Reveal */}
      {/* - Layer 3: Cyan Holographic Skeleton Blueprint with continuous face scan */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-auto z-10 perspective-1000 overflow-hidden">
        {/* Dedicated Responsive Scale Container: Immune to GSAP transform overrides on portraitStageRef */}
        <div className="relative w-full h-full flex items-end justify-center max-sm:scale-[2.85] max-sm:origin-bottom sm:scale-100">
          <div
            ref={portraitStageRef}
            className="relative w-full h-full flex items-end justify-center preserve-3d origin-bottom"
          >
            {/* Aspect-Locked 16:9 Stage: Guarantees 100% pixel alignment and accurate facial scan coordinates on ALL mobile & desktop screens */}
            <div className="relative w-full max-w-[calc(100vh*16/9)] aspect-[16/9] max-h-full flex items-end justify-center">
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
                {/* 3A: Ambient Ghost Skeleton Blueprint (Low Opacity: ~0.08) */}
                <div
                  ref={skeletonBaseRef}
                  className="absolute inset-0 w-full h-full opacity-0 mix-blend-screen"
                >
                  <Image
                    src="/assets/mask_blueprint.png"
                    alt="Skeleton Wireframe Ambient"
                    fill
                    priority
                    className="object-contain object-bottom filter brightness-110"
                  />
                </div>

                {/* 3B: High-Intensity Active Scanning Band (Soft 2D Elliptical Radial Mask with Fade In & Out) */}
                <div
                  ref={skeletonScanRef}
                  className="absolute inset-0 w-full h-full mix-blend-screen opacity-0 transition-all duration-75"
                >
                  <Image
                    src="/assets/mask_blueprint.png"
                    alt="Skeleton Wireframe Active Scan"
                    fill
                    priority
                    className="object-contain object-bottom filter brightness-175 drop-shadow-[0_0_15px_#00f0ff] drop-shadow-[0_0_30px_#00f0ff]"
                  />
                </div>
              </div>
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
            className=" w-28 sm:w-40 lg:w-52 h-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all duration-300"
          />
        </div>
      </footer>
    </div>
  );
};
