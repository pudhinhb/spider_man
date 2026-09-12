"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export const CustomSpiderCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spiderSenseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return;

    const spiderSense = spiderSenseRef.current;
    if (!spiderSense) return;

    const handleMouseDown = (e: MouseEvent) => {
      gsap.killTweensOf(spiderSense);
      gsap.fromTo(
        spiderSense,
        {
          x: e.clientX,
          y: e.clientY,
          scale: 0.3,
          opacity: 1,
        },
        {
          scale: 2.4,
          opacity: 0,
          duration: 0.45,
          ease: "power2.out",
        }
      );
    };

    window.addEventListener("mousedown", handleMouseDown, { passive: true });

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
    >
      {/* Spider-Sense Shockwave Ring on Click */}
      <div
        ref={spiderSenseRef}
        className="fixed top-0 left-0 w-20 h-20 -ml-10 -mt-10 rounded-full border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.9)] opacity-0 pointer-events-none"
      />
    </div>
  );
};
