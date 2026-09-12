"use client";

import React from "react";

interface SpiderWebCornerProps {
  position?: "left" | "right";
  className?: string;
}

export const SpiderWebCorner: React.FC<SpiderWebCornerProps> = ({
  position = "left",
  className = "",
}) => {
  const isLeft = position === "left";

  return (
    <div
      className={`pointer-events-none select-none ${
        isLeft ? "origin-top-left" : "origin-top-right"
      } ${className}`}
      aria-hidden="true"
    >
      {/* Hanging thread from ceiling */}
      <div
        className={`w-[1px] bg-gradient-to-b from-red-500/60 via-zinc-400/40 to-transparent ${
          isLeft ? "ml-8 md:ml-16 h-12 md:h-24" : "mr-8 md:mr-16 ml-auto h-12 md:h-24"
        }`}
      />

      {/* Spider Web Geometric SVG */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-32 h-32 md:w-56 md:h-56 stroke-zinc-400/30 dark:stroke-red-500/25 transition-opacity duration-700 ${
          isLeft ? "rotate-0" : "-scale-x-100"
        }`}
        strokeWidth="1"
      >
        {/* Radial Web Spines */}
        <line x1="0" y1="0" x2="200" y2="0" />
        <line x1="0" y1="0" x2="190" y2="60" />
        <line x1="0" y1="0" x2="160" y2="120" />
        <line x1="0" y1="0" x2="120" y2="160" />
        <line x1="0" y1="0" x2="60" y2="190" />
        <line x1="0" y1="0" x2="0" y2="200" />

        {/* Concentric Spiral Arcs */}
        {/* Tier 1 */}
        <path d="M 30 0 Q 28 8 26 14 Q 22 22 14 26 Q 8 28 0 30" fill="none" />
        {/* Tier 2 */}
        <path d="M 60 0 Q 56 16 52 28 Q 44 44 28 52 Q 16 56 0 60" fill="none" />
        {/* Tier 3 */}
        <path d="M 95 0 Q 88 26 82 45 Q 70 70 45 82 Q 26 88 0 95" fill="none" />
        {/* Tier 4 */}
        <path d="M 130 0 Q 120 36 112 62 Q 95 95 62 112 Q 36 120 0 130" fill="none" />
        {/* Tier 5 */}
        <path d="M 165 0 Q 152 46 142 79 Q 120 120 79 142 Q 46 152 0 165" fill="none" />
        {/* Tier 6 */}
        <path d="M 200 0 Q 184 56 172 96 Q 146 146 96 172 Q 56 184 0 200" fill="none" />

        {/* Center Node / Spider Silk Drop Dot */}
        <circle cx="0" cy="0" r="3" className="fill-red-600/70" />
        <circle cx="95" cy="45" r="1.5" className="fill-red-500/50" />
        <circle cx="45" cy="82" r="1.5" className="fill-red-500/50" />
      </svg>
    </div>
  );
};
