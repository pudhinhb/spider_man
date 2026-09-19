"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { soundManager } from "@/lib/sound";
import { FluidBgCanvas } from "@/components/FluidBgCanvas";
import { FluidSpideyCanvas } from "@/components/FluidSpideyCanvas";
import SideRays from "@/components/SideRays";
import { HeroMusicWave } from "@/components/HeroMusicWave";

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
      // 1. Entrance Animation for Full-Screen Stage (Subtle and Smooth)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        portraitStageRef.current,
        { scale: 0.98, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: "power3.out" }
      );

      // 2. CONTINUOUS TOP-TO-BOTTOM FACE SCANNING ANIMATION (50% Opacity + 10% Glow Boost while appearing)
      // Organic elliptical radial mask sweeping across facial region
      const scanTl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });

      const scanObj = { progress: 0 };
      scanTl.to(scanObj, {
        progress: 100,
        duration: 3.0,
        onUpdate: () => {
          const p = scanObj.progress;
          // Calculate vertical position across facial region (sweeping smoothly across eyes, nose, cheeks)
          const topPercent = 8 + p * 0.48;

          // Sinusoidal curve peaking at 75% (0.75) opacity when appearing
          const edgeFade = Math.sin((p / 100) * Math.PI);
          const scanOpacity = Math.pow(edgeFade, 0.65) * 0.75;

          // +10% dynamic holographic cyan glow boost while appearing
          const glowIntensity = 0.45 + edgeFade * 0.10; // +10% glow when appearing
          const glowRadius = Math.round(10 + edgeFade * 6);

          // Soft 2D Elliptical Radial Gradient Mask centered over the face wireframe
          if (skeletonScanRef.current) {
            skeletonScanRef.current.style.opacity = `${scanOpacity}`;
            const ellipticalMask = `radial-gradient(ellipse 28% 13% at 51% ${topPercent}%, black 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.25) 75%, transparent 100%)`;
            skeletonScanRef.current.style.webkitMaskImage = ellipticalMask;
            skeletonScanRef.current.style.maskImage = ellipticalMask;
            skeletonScanRef.current.style.filter = `brightness(${1.25 + edgeFade * 0.15}) contrast(1.15) drop-shadow(0 0 ${glowRadius}px rgba(0, 240, 255, ${glowIntensity})) drop-shadow(0 0 24px rgba(0, 240, 255, 0.35))`;
          }
        },
      });

      // 3. Refined Parallax 3D Tilt on Mouse Movement (Reduced amplitude for tighter feel)
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const xPercent = (e.clientX / innerWidth - 0.5) * 2;
        const yPercent = (e.clientY / innerHeight - 0.5) * 2;

        if (portraitStageRef.current) {
          gsap.to(portraitStageRef.current, {
            rotationY: xPercent * 1.6,
            rotationX: -yPercent * 1.2,
            x: xPercent * 4,
            y: yPercent * 3,
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
      className="hero-spidey-cursor relative w-full h-screen min-h-screen flex flex-col justify-between overflow-hidden bg-black text-white select-none"
    >
      {/* ========================================================================= */}
      {/* TOP-RIGHT CORNER: WHITE MUSIC WAVES EQUALIZER & SPIDER-MAN THEME PLAYER   */}
      {/* ========================================================================= */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-40 pointer-events-auto">
        <HeroMusicWave />
      </div>

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
        {/* Dedicated Responsive Scale Container: Scaled up to 0.85 for a slightly bigger, well-balanced presence */}
        <div className="relative w-full h-full flex items-end justify-center max-sm:scale-[2.35] max-sm:origin-bottom sm:scale-[0.85] origin-bottom transition-transform duration-300">
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

              {/* LAYER 3: SKELETON BLUEPRINT WITH DELICATE TOP-TO-BOTTOM SCANNING */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex items-end justify-center">
                {/* 3A: Ambient Ghost Skeleton Blueprint */}
                <div
                  ref={skeletonBaseRef}
                  className="absolute inset-0 w-full h-full opacity-0 mix-blend-overlay"
                  style={{ mixBlendMode: "overlay" }}
                >
                  <Image
                    src="/assets/mask_blueprint.png"
                    alt="Skeleton Wireframe Ambient"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-contain object-bottom filter brightness-110"
                  />
                </div>

                {/* 3B: Active Scanning Band with 75% Opacity and Overlay Blend Filter */}
                <div
                  ref={skeletonScanRef}
                  className="absolute inset-0 w-full h-full mix-blend-overlay opacity-0 transition-all duration-75"
                  style={{ mixBlendMode: "overlay" }}
                >
                  <Image
                    src="/assets/mask_blueprint.png"
                    alt="Skeleton Wireframe Active Scan"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-contain object-bottom filter brightness-135 contrast-125 drop-shadow-[0_0_12px_#00f0ff] drop-shadow-[0_0_24px_rgba(0,240,255,0.4)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
