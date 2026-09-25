"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PHRASE = "With great ideas comes great design.     ";
const REPEATED_TEXT = Array(20).fill(PHRASE).join("");

export const CurvedBackgroundRibbon: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const [pathD, setPathD] = useState<string>("");

  useEffect(() => {
    const updatePath = () => {
      const wrapper = document.getElementById("white-canvas-wrapper");
      const toolbar = document.getElementById("creative-toolbar-box");
      const sec4 = document.getElementById("about-me-section");

      if (!wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const W = wrapperRect.width || window.innerWidth;
      const H = wrapperRect.height || window.innerHeight * 2;

      // Start position: center of the Section 3 toolbox if found, or top-center
      let x0 = W * 0.5;
      let y0 = H * 0.28;

      if (toolbar) {
        const tbRect = toolbar.getBoundingClientRect();
        x0 = tbRect.left - wrapperRect.left + tbRect.width / 2;
        y0 = tbRect.top - wrapperRect.top + tbRect.height / 2;
      }

      // Section 4 offset relative to wrapper
      let sec4Top = H * 0.5;
      if (sec4) {
        sec4Top = sec4.offsetTop;
      }

      // Compute smooth, organic serpentine control points:
      // 1. Starts at Section 3 toolbox (x0, y0)
      // 2. Sweeps right towards Section 3 right margin
      const x1 = Math.min(W - 48, W * 0.88);
      const y1 = y0 + (sec4Top - y0) * 0.48;

      // 3. Curves down and in as it enters Section 4
      const x2 = Math.min(W - 60, W * 0.72);
      const y2 = sec4Top + 90;

      // 4. Sweeps diagonally left behind Section 4 story & polaroids
      const x3 = Math.max(50, W * 0.28);
      const y3 = sec4Top + 380;

      // 5. Loops gently on the left side of Section 4
      const x4 = Math.max(40, W * 0.16);
      const y4 = sec4Top + 640;

      // 6. Sweeps under the skill badges toward bottom right
      const x5 = Math.min(W - 60, W * 0.85);
      const y5 = H - 90;

      // Generate smooth cubic bezier curve
      const d = [
        `M ${x0.toFixed(1)} ${y0.toFixed(1)}`,
        `C ${(x0 + (x1 - x0) * 0.55).toFixed(1)} ${(y0 - 25).toFixed(1)}, ${(x1 - 40).toFixed(1)} ${(y1 - 120).toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`,
        `C ${(x1 + 40).toFixed(1)} ${(y1 + 130).toFixed(1)}, ${(x2 + 90).toFixed(1)} ${(y2 - 110).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`,
        `C ${(x2 - 130).toFixed(1)} ${(y2 + 110).toFixed(1)}, ${(x3 + 130).toFixed(1)} ${(y3 - 90).toFixed(1)}, ${x3.toFixed(1)} ${y3.toFixed(1)}`,
        `C ${(x3 - 110).toFixed(1)} ${(y3 + 90).toFixed(1)}, ${(x4 - 35).toFixed(1)} ${(y4 - 100).toFixed(1)}, ${x4.toFixed(1)} ${y4.toFixed(1)}`,
        `C ${(x4 + 35).toFixed(1)} ${(y4 + 120).toFixed(1)}, ${(x5 - 130).toFixed(1)} ${(y5 - 60).toFixed(1)}, ${x5.toFixed(1)} ${y5.toFixed(1)}`,
      ].join(" ");

      setPathD(d);
    };

    updatePath();
    const timer = setTimeout(updatePath, 200);

    window.addEventListener("resize", updatePath);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePath);
    };
  }, []);

  // GSAP ScrollTrigger animation for path stroke reveal & text movement
  useEffect(() => {
    const path = pathRef.current;
    const textPath = textPathRef.current;
    const wrapper = document.getElementById("white-canvas-wrapper");

    if (!path || !textPath || !wrapper || !pathD) return;

    const totalLength = path.getTotalLength();
    if (totalLength <= 0) return;

    // Set initial dasharray for drawing animation
    path.style.strokeDasharray = `${totalLength}`;
    path.style.strokeDashoffset = `${totalLength}`;

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top 35%",
      end: "bottom 95%",
      scrub: 1.2,
      onUpdate: (self) => {
        const progress = self.progress; // 0 to 1

        // 1. Draw the ribbon as user scrolls
        // Ribbon reaches full length by ~80% of the combined scroll range
        const drawProgress = Math.min(1, progress * 1.28);
        path.style.strokeDashoffset = `${totalLength * (1 - drawProgress)}`;

        // 2. Flow the text along the path with scroll velocity
        const offsetPercent = progress * -24;
        textPath.setAttribute("startOffset", `${offsetPercent}%`);
      },
    });

    return () => {
      st.kill();
    };
  }, [pathD]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-[3] overflow-hidden select-none">
      <svg
        ref={svgRef}
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="ribbon-glow-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="10"
              floodColor="#dc2626"
              floodOpacity="0.28"
            />
          </filter>
        </defs>

        {pathD && (
          <>
            {/* The Red Ribbon Path (Solid Spider-Man Red with tactile curved stroke) */}
            <path
              id="red-curved-ribbon-path"
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="#DC2626"
              strokeWidth={46}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ribbon-glow-shadow)"
            />

            {/* Continuous White Bold Text flowing on the ribbon path */}
            <text dy="0.5" className="select-none pointer-events-none">
              <textPath
                ref={textPathRef}
                href="#red-curved-ribbon-path"
                startOffset="0%"
                fill="#ffffff"
                style={{
                  fontFamily: "var(--font-sora), sans-serif",
                  fontSize: "14.5px",
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  dominantBaseline: "central",
                }}
              >
                {REPEATED_TEXT}
              </textPath>
            </text>
          </>
        )}
      </svg>
    </div>
  );
};
