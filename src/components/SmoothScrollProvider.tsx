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
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.15,
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

    // 3. Butter-Smooth Directional Section Stop Controller
    // Holds one crisp, elegant stop at each distinct portfolio stage without fighting Lenis
    let isSnapping = false;
    let snapTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastDirection = 0;

    const getAbsoluteTop = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return Math.round(rect.top + window.scrollY);
    };

    const getStopPoints = () => {
      const creative = document.getElementById("creative-section");
      const about = document.getElementById("about-me-section");
      const design = document.getElementById("design-showcase-section");

      const stops: { id: string; top: number }[] = [{ id: "hero", top: 0 }];

      if (creative) {
        stops.push({ id: "creative", top: getAbsoluteTop(creative) });
      }
      if (about) {
        stops.push({ id: "about", top: getAbsoluteTop(about) });
      }
      if (design) {
        stops.push({ id: "design", top: getAbsoluteTop(design) });
      }

      return stops;
    };

    const handleSectionStop = (currentScroll: number, direction: number) => {
      if (isSnapping) return;

      const stops = getStopPoints();
      if (stops.length < 2) return;

      const creativeStop = stops[1]?.top ?? 1500;

      // ─────────────────────────────────────────────────────────────
      // A. HERO SCRUB PROTECTION:
      // If user is inside the 280vh hero pinned zoom-out, let them scrub
      // the Spider-Man animation with 100% fluid freedom without jerking!
      // ─────────────────────────────────────────────────────────────
      if (currentScroll > 140 && currentScroll < creativeStop - 280) {
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // B. HERO START (STOP 1):
      // If user rests near the very top of hero, glide into 0
      // ─────────────────────────────────────────────────────────────
      if (currentScroll <= 140 && currentScroll > 15) {
        isSnapping = true;
        lenis.scrollTo(0, {
          duration: 0.95,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          onComplete: () => {
            isSnapping = false;
          },
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // C. HERO EXIT -> CREATIVE THINGS (STOP 2):
      // Once user scrolls past the hero zoom-out, settle at Creative Things
      // ─────────────────────────────────────────────────────────────
      if (currentScroll >= creativeStop - 280 && currentScroll < creativeStop + 120) {
        if (Math.abs(currentScroll - creativeStop) > 12) {
          isSnapping = true;
          lenis.scrollTo(creativeStop, {
            duration: 1.0,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            onComplete: () => {
              isSnapping = false;
            },
          });
        }
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // D. SECTION-TO-SECTION DIRECTIONAL STOPPING:
      // Between Creative Things, About Me, and Design Showcase
      // ─────────────────────────────────────────────────────────────
      for (let i = 1; i < stops.length; i++) {
        const currentSection = stops[i];
        const nextSection = stops[i + 1];

        if (!nextSection) {
          // At or near the last section (Design Showcase)
          if (Math.abs(currentScroll - currentSection.top) > 12) {
            isSnapping = true;
            lenis.scrollTo(currentSection.top, {
              duration: 1.0,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              onComplete: () => {
                isSnapping = false;
              },
            });
          }
          break;
        }

        if (currentScroll >= currentSection.top && currentScroll < nextSection.top) {
          const deltaFromCurrent = currentScroll - currentSection.top;
          const totalDistance = nextSection.top - currentSection.top;

          let targetTop = currentSection.top;

          if (direction > 0 && deltaFromCurrent > 80) {
            // User scrolled down intentionally: glide to next section stop!
            targetTop = nextSection.top;
          } else if (direction < 0 && deltaFromCurrent < totalDistance - 80) {
            // User scrolled up intentionally: return to current section stop!
            targetTop = currentSection.top;
          } else {
            // Nudge/small scroll: snap to nearest section
            targetTop = deltaFromCurrent > totalDistance * 0.5 ? nextSection.top : currentSection.top;
          }

          if (Math.abs(currentScroll - targetTop) > 12) {
            isSnapping = true;
            lenis.scrollTo(targetTop, {
              duration: 1.05,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              onComplete: () => {
                isSnapping = false;
              },
            });
          }
          break;
        }
      }
    };

    const onLenisScroll = (e: any) => {
      if (e.direction) {
        lastDirection = e.direction;
      }

      if (isSnapping) return;

      if (snapTimeout) clearTimeout(snapTimeout);

      // Trigger section stop settle when scrolling momentum drops
      if (Math.abs(e.velocity) < 0.08) {
        snapTimeout = setTimeout(() => {
          handleSectionStop(e.scroll, lastDirection);
        }, 160);
      }
    };

    lenis.on("scroll", onLenisScroll);

    return () => {
      if (snapTimeout) clearTimeout(snapTimeout);
      lenis.off("scroll", onLenisScroll);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
