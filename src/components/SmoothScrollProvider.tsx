"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  useEffect(() => {
    // 1. Initialize Lenis for luxurious, momentum-damped smooth scrolling
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
      infinite: false,
    });

    // 2. Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // 3. Section Snapping / Stop Controller (Hold one stop for every section)
    // Ensures scrolling cleanly stops & locks at the start of each distinct section
    const setupSectionSnapping = () => {
      const sections = [
        document.getElementById("chapter-2-scroll"),
        document.getElementById("creative-section"),
        document.getElementById("about-me-section"),
        document.getElementById("screen-3-sketchbook"),
      ].filter(Boolean) as HTMLElement[];

      if (sections.length > 0) {
        // Create ScrollTrigger snap points
        ScrollTrigger.create({
          start: 0,
          end: "max",
          snap: {
            snapTo: (progress) => {
              const maxScroll = ScrollTrigger.maxScroll(window);
              if (maxScroll <= 0) return progress;

              // Calculate normalized positions for section anchors
              const snapTargets: number[] = [0];

              sections.forEach((sec) => {
                const rect = sec.getBoundingClientRect();
                const absoluteTop = window.scrollY + rect.top;
                const normalizedPos = absoluteTop / maxScroll;
                if (normalizedPos >= 0 && normalizedPos <= 1) {
                  snapTargets.push(normalizedPos);
                }
              });

              // Also snap to the very end
              snapTargets.push(1);

              // Find closest snap target
              let closest = snapTargets[0];
              let minDist = Math.abs(progress - closest);

              for (let i = 1; i < snapTargets.length; i++) {
                const dist = Math.abs(progress - snapTargets[i]);
                if (dist < minDist) {
                  minDist = dist;
                  closest = snapTargets[i];
                }
              }

              return closest;
            },
            duration: { min: 0.25, max: 0.65 },
            delay: 0.08,
            ease: "power2.out",
          },
        });
      }
    };

    // Small delay to ensure all DOM heights are fully settled
    const snapTimer = setTimeout(setupSectionSnapping, 250);

    return () => {
      clearTimeout(snapTimer);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return <>{children}</>;
};
