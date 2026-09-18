"use client";

import React from "react";
import Ferrofluid from "@/components/Ferrofluid";
import { SketchbookWidget } from "@/components/SketchbookWidget";

export const SketchbookSection: React.FC = () => {
  return (
    <section
      id="screen-3-sketchbook"
      className="sketchbook-root relative w-full min-h-screen py-20 sm:py-28 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: "#0a0a0a" }}
    >
      {/* ========================================================================= */}
      {/* SCREEN 2 BACKGROUND: Ferrofluid Liquid Metal Canvas Animation            */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto opacity-25 z-0 overflow-hidden">
        <Ferrofluid
          colors={["#ffffff", "#ffffff", "#ffffff"]}
          speed={0.2}
          scale={1}
          turbulence={1}
          fluidity={0.06}
          rimWidth={0.18}
          sharpness={1.8}
          shimmer={1}
          glow={2}
          flowDirection="up"
          opacity={0.25}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.6}
        />
      </div>

      {/* Atmospheric Gallery Spotlight centered behind the A4 Book */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1150px] h-[800px] pointer-events-none z-1 opacity-45 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(212, 175, 55, 0.12) 0%, rgba(0, 240, 255, 0.04) 45%, transparent 75%)",
        }}
      />

      {/* Reusable 3D Flipbook & Loupe Widget */}
      <SketchbookWidget />
    </section>
  );
};
