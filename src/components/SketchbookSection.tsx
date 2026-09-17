"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import Ferrofluid from "@/components/Ferrofluid";
import { soundManager } from "@/lib/sound";
import "./Sketchbook.css";

interface BookSpreadItem {
  id: number;
  type: "cover" | "spread" | "back_cover";
  spreadUrl: string;
  singleUrl: string;
  title: string;
  place: string;
}

const BOOK_SPREADS: BookSpreadItem[] = [
  {
    id: 0,
    type: "cover",
    spreadUrl: "/sketchbook/spread_0.png",
    singleUrl: "/sketchbook/spread_0.png",
    title: "LearnRyce — From Learner to Leader",
    place: "Front Cover · Page 01",
  },
  {
    id: 1,
    type: "spread",
    spreadUrl: "/sketchbook/spread_1.png",
    singleUrl: "/sketchbook/spread_1.png",
    title: "About Us & Career Counselling",
    place: "Inside Spread 1 · Pages 02 & 03",
  },
  {
    id: 2,
    type: "spread",
    spreadUrl: "/sketchbook/spread_2.png",
    singleUrl: "/sketchbook/spread_2.png",
    title: "Study Abroad & Language Training",
    place: "Inside Spread 2 · Pages 04 & 05",
  },
  {
    id: 3,
    type: "back_cover",
    spreadUrl: "/sketchbook/spread_3.png",
    singleUrl: "/sketchbook/spread_3.png",
    title: "Why Students Trust LearnRyce",
    place: "Back Cover · Page 06",
  },
];

const TOTAL_STATES = BOOK_SPREADS.length;
const TILT_X = 3.6;
const TILT_Y = 5.2;
const ZOOM_MIN = 0.9;
const ZOOM_MAX = 1.5;
const MAG = 2.3;

/* ---------------- Turn Indicator SVG Arrow (Image 3 Reference) ---------------- */
const FlipArrowSvg: React.FC<{ flipped?: boolean }> = ({ flipped }) => (
  <svg
    viewBox="0 0 24 24"
    width="32"
    height="32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`sb-turn-arrow-svg ${flipped ? "flipped" : ""}`}
    aria-hidden="true"
  >
    <path
      d="m12.8399 11.55 2.09 3.44 4.07-9.48-10.74997-1.51 2.07997 3.41-.04.03c-1.28997.95-2.58997 2.11-3.44997 3.67-.88 1.57-1.06 3.38-.58 4.98.47 1.66 1.87 2.91 3.32 3.44 1.46997.56 3.02997.59 4.40997.25-1.43-.05-2.79-.5-3.8-1.26-1.00997-.77-1.54997-1.81-1.48997-2.81.04-1.03.53-2 1.26-2.62.72997-.66 1.74997-1.15 2.87997-1.54z"
      fill="white"
    />
  </svg>
);

export const SketchbookSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sb3dRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const loupeImgRef = useRef<HTMLImageElement>(null);
  const shineTlRef = useRef<gsap.core.Timeline | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageFlipRef = useRef<any>(null);
  const shiftProxy = useRef<{ x: number }>({ x: -25 });

  const [stateIndex, setStateIndex] = useState<number>(0);
  const stateIndexRef = useRef<number>(0);

  const viewRef = useRef<{
    rx: number;
    ry: number;
    z: number;
    trx: number;
    try_: number;
    tz: number;
    lastZ: number;
    loupeOn: boolean;
    lx: number | null;
    ly: number | null;
    lgrab: { cx: number; cy: number; lx0: number; ly0: number } | null;
  }>({
    rx: 0,
    ry: 0,
    z: 1,
    trx: 0,
    try_: 0,
    tz: 1,
    lastZ: 1,
    loupeOn: true,
    lx: null,
    ly: null,
    lgrab: null,
  });

  /* ---------------- Loupe & Optical Magnification Optics ---------------- */
  const loupeSize = useCallback(() => {
    const book = bookRef.current;
    const bw = book ? book.clientWidth : 1040;
    return Math.round(Math.max(180, Math.min(260, bw * 0.22)));
  }, []);

  const placeLoupe = useCallback(() => {
    const v = viewRef.current;
    const loupe = loupeRef.current;
    const loupeImg = loupeImgRef.current;
    const book = bookRef.current;
    const section = sectionRef.current;
    if (!loupe || v.lx === null || v.ly === null) return;

    const D = loupeSize();
    const R = D / 2;
    loupe.style.setProperty("--lr", `${D}px`);
    loupe.style.transform = `translate3d(${(v.lx - R).toFixed(1)}px, ${(v.ly - R).toFixed(1)}px, 0)`;

    if (v.loupeOn) loupe.classList.add("on");
    else loupe.classList.remove("on");

    if (loupeImg && book && section) {
      const bookRect = book.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      const lensScreenX = sectionRect.left + v.lx;
      const lensScreenY = sectionRect.top + v.ly;

      const bookPointX = lensScreenX - bookRect.left;
      const bookPointY = lensScreenY - bookRect.top;

      const bw = book.clientWidth;
      const bh = book.clientHeight;
      if (bw && bh) {
        const magW = bw * MAG;
        const magH = bh * MAG;
        loupeImg.style.width = `${magW.toFixed(1)}px`;
        loupeImg.style.height = `${magH.toFixed(1)}px`;

        const imgX = R - bookPointX * MAG;
        const imgY = R - bookPointY * MAG;
        loupeImg.style.transform = `translate3d(${imgX.toFixed(1)}px, ${imgY.toFixed(1)}px, 0)`;
      }
    }
  }, [loupeSize]);

  const getDockPosition = useCallback(() => {
    const section = sectionRef.current;
    const book = bookRef.current;
    const secW = section ? section.clientWidth : window.innerWidth;
    const secH = section ? section.clientHeight : window.innerHeight;
    const D = loupeSize();
    const R = D / 2;

    const peekWidth = 48;
    const targetX = secW - peekWidth + R;

    let targetY = secH / 2;
    if (book && section) {
      const bRect = book.getBoundingClientRect();
      const sRect = section.getBoundingClientRect();
      targetY = bRect.top - sRect.top + bRect.height * 0.48;
    }
    return { x: targetX, y: targetY };
  }, [loupeSize]);

  const restLoupe = useCallback(() => {
    const dock = getDockPosition();
    viewRef.current.lx = dock.x;
    viewRef.current.ly = dock.y;
    placeLoupe();
  }, [getDockPosition, placeLoupe]);

  const shoveLoupe = useCallback(() => {
    const v = viewRef.current;
    if (!v.loupeOn || v.lx === null || v.lgrab) return;

    const dock = getDockPosition();
    gsap.to(v, {
      lx: dock.x,
      ly: dock.y,
      duration: 0.7,
      ease: "power2.out",
      onUpdate: placeLoupe,
    });
  }, [getDockPosition, placeLoupe]);

  /* ---------------- Shift Transition Between Cover & Spreads ---------------- */
  const updateShift = useCallback(
    (sIdx: number) => {
      let target = 0;
      if (sIdx === 0) target = -25;
      else if (sIdx === 3) target = 25;
      else target = 0;

      gsap.to(shiftProxy.current, {
        x: target,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => {
          if (tiltRef.current) {
            tiltRef.current.style.setProperty("--shift-x", `${shiftProxy.current.x.toFixed(2)}%`);
          }
          placeLoupe();
        },
      });
    },
    [placeLoupe]
  );

  /* ---------------- GSAP Diagonal Glossy Shine Effect ---------------- */
  const initCoverShine = useCallback(() => {
    if (shineTlRef.current) {
      shineTlRef.current.kill();
      shineTlRef.current = null;
    }
    const beam = document.querySelector<HTMLElement>(".sb-shine-beam");
    if (!beam) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.6 });
    tl.set(beam, {
      xPercent: -120,
      yPercent: -120,
      opacity: 0,
    });

    tl.to(
      beam,
      {
        opacity: 0.95,
        duration: 0.7,
        ease: "power1.in",
      },
      0
    );

    tl.to(
      beam,
      {
        xPercent: 120,
        yPercent: 120,
        duration: 3.8,
        ease: "power1.inOut",
      },
      0
    );

    tl.to(
      beam,
      {
        opacity: 0,
        duration: 0.9,
        ease: "power1.out",
      },
      2.9
    );

    shineTlRef.current = tl;
  }, []);

  /* ---------------- 3D Perspective Tilt ---------------- */
  const applyView = useCallback(() => {
    const tilt = tiltRef.current;
    const v = viewRef.current;
    if (!tilt) return;
    tilt.style.setProperty("--rx", `${v.rx.toFixed(2)}deg`);
    tilt.style.setProperty("--ry", `${v.ry.toFixed(2)}deg`);
    tilt.style.setProperty("--zoom", `${v.z.toFixed(3)}`);
    if (v.z !== v.lastZ) {
      v.lastZ = v.z;
      placeLoupe();
    }
  }, [placeLoupe]);

  const setView = useCallback(
    (rx: number, ry: number, z: number) => {
      const v = viewRef.current;
      v.trx = Math.max(-TILT_X, Math.min(TILT_X, rx));
      v.try_ = Math.max(-TILT_Y, Math.min(TILT_Y, ry));
      v.tz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
      v.rx = v.trx;
      v.ry = v.try_;
      v.z = v.tz;
      applyView();
    },
    [applyView]
  );

  const tiltTo = useCallback(
    (cx: number, cy: number) => {
      if (viewRef.current.lgrab) return;
      const book = bookRef.current;
      if (!book) return;
      const r = book.getBoundingClientRect();
      if (!r.width) return;
      const nx = Math.max(-1, Math.min(1, (cx - (r.left + r.width / 2)) / (r.width * 0.65)));
      const ny = Math.max(-1, Math.min(1, (cy - (r.top + r.height / 2)) / (r.height * 0.9)));
      const v = viewRef.current;
      v.rx = -ny * TILT_X;
      v.ry = nx * TILT_Y;
      applyView();
    },
    [applyView]
  );

  /* ---------------- Arrow Navigation Handlers ---------------- */
  const handleArrowClick = useCallback((dir: "next" | "prev") => {
    if (!pageFlipRef.current) return;
    shoveLoupe();
    soundManager.playThwip();
    if (dir === "next") {
      pageFlipRef.current.flipNext("bottom");
    } else {
      pageFlipRef.current.flipPrev("bottom");
    }
  }, [shoveLoupe]);

  /* ---------------- Initialize PageFlip Engine ---------------- */
  useEffect(() => {
    let isMounted = true;
    let pageFlipInstance: any = null;

    const setupBook = async () => {
      const bookContainer = bookRef.current;
      if (!bookContainer) return;

      // Populate pages into DOM container before PageFlip takes over
      bookContainer.innerHTML = `
        <div class="sb-page" data-density="soft">
          <img src="/brochure/page-1.png" alt="Cover" class="sb-page-img" />
          <div class="sb-cover-shine">
            <div class="sb-shine-beam"></div>
          </div>
        </div>
        <div class="sb-page" data-density="soft">
          <img src="/brochure/page-2.png" alt="About Us" class="sb-page-img" />
        </div>
        <div class="sb-page" data-density="soft">
          <img src="/brochure/page-3.png" alt="School & College" class="sb-page-img" />
        </div>
        <div class="sb-page" data-density="soft">
          <img src="/brochure/page-4.png" alt="Study Abroad" class="sb-page-img" />
        </div>
        <div class="sb-page" data-density="soft">
          <img src="/brochure/page-5.png" alt="Language Training" class="sb-page-img" />
        </div>
        <div class="sb-page" data-density="soft">
          <img src="/brochure/page-6.png" alt="Back Cover" class="sb-page-img" />
        </div>
      `;

      const { PageFlip } = await import("page-flip");
      if (!isMounted) return;

      const pf = new PageFlip(bookContainer, {
        width: 520,
        height: 735,
        size: "stretch",
        minWidth: 315,
        maxWidth: 1040,
        minHeight: 445,
        maxHeight: 1470,
        maxShadowOpacity: 0.55,
        showCover: true,
        showPageCorners: true,
        drawShadow: true,
        flippingTime: 850,
        usePortrait: false,
        mobileScrollSupport: false,
        useMouseEvents: true,
      });

      pageFlipInstance = pf;
      pageFlipRef.current = pf;
      if (typeof window !== "undefined") {
        (window as any).debugPageFlip = pf;
      }

      const pageNodes = bookContainer.querySelectorAll<HTMLElement>(".sb-page");
      pf.loadFromHTML(pageNodes);

      pf.on("init", () => {
        if (!isMounted) return;
        // Make every page (including cover & back cover) soft paper so corners peel diagonally
        for (let i = 0; i < pf.getPageCount(); i++) {
          const p = pf.getPage(i);
          if (p) p.setDensity("soft");
        }

        // Hook render.drawFrame to prevent background pages from showing when turning both cover pages
        const render = pf.getRender() as any;
        if (render) {
          const origDrawFrame = render.drawFrame.bind(render);
          render.drawFrame = function () {
            origDrawFrame();

            const collection = this.app.getPageCollection();
            if (!collection) return;
            const currentSpread = collection.getCurrentSpreadIndex();
            const spreads = collection.getSpread();
            const direction = this.getDirection();
            const calc = this.app.getFlipController() ? this.app.getFlipController().getCalculation() : null;

            // Case 1: Turning forward to Back Cover (Spread 2 -> Spread 3)
            if (direction === 0 && currentSpread === spreads.length - 2 && this.flippingPage) {
              // Clip rightPage (Page 5) so the peeled corner is cut out completely (empty desk behind)
              if (this.rightPage && calc) {
                const rect = this.getRect();
                const W = rect.pageWidth;
                const H = rect.height;
                const corner = calc.getCorner();
                const progress = calc.getFlippingProgress();

                if (progress >= 95) {
                  this.rightPage.getElement().style.display = "none";
                } else if (corner === "bottom") {
                  const p1 = calc.sideIntersectPoint || calc.topIntersectPoint;
                  const p2 = calc.bottomIntersectPoint;
                  if (p1 && p2) {
                    const poly = `polygon(0px 0px, ${W}px 0px, ${p1.x.toFixed(1)}px ${p1.y.toFixed(1)}px, ${p2.x.toFixed(1)}px ${p2.y.toFixed(1)}px, 0px ${H}px)`;
                    this.rightPage.getElement().style.clipPath = poly;
                    this.rightPage.getElement().style.webkitClipPath = poly;
                  }
                } else {
                  const p1 = calc.topIntersectPoint;
                  const p2 = calc.sideIntersectPoint || calc.bottomIntersectPoint;
                  if (p1 && p2) {
                    const poly = `polygon(0px 0px, ${W}px 0px, ${p1.x.toFixed(1)}px ${p1.y.toFixed(1)}px, ${p2.x.toFixed(1)}px ${p2.y.toFixed(1)}px, ${W}px ${H}px, 0px ${H}px)`;
                    this.rightPage.getElement().style.clipPath = poly;
                    this.rightPage.getElement().style.webkitClipPath = poly;
                  }
                }
              }
            }

            // Case 2: Turning backward to Front Cover (Spread 1 -> Spread 0)
            if (direction === 1 && currentSpread === 1 && this.flippingPage) {
              // Clip leftPage (Page 2) so the peeled corner is cut out completely (empty desk behind)
              if (this.leftPage && calc) {
                const rect = this.getRect();
                const W = rect.pageWidth;
                const H = rect.height;
                const corner = calc.getCorner();
                const progress = calc.getFlippingProgress();

                if (progress >= 95) {
                  this.leftPage.getElement().style.display = "none";
                } else if (corner === "bottom") {
                  const p1 = calc.sideIntersectPoint || calc.topIntersectPoint;
                  const p2 = calc.bottomIntersectPoint;
                  if (p1 && p2) {
                    const lx1 = W - p1.x;
                    const lx2 = W - p2.x;
                    const poly = `polygon(${lx1.toFixed(1)}px ${p1.y.toFixed(1)}px, ${W}px 0px, ${W}px ${H}px, 0px ${H}px, ${lx2.toFixed(1)}px ${p2.y.toFixed(1)}px)`;
                    this.leftPage.getElement().style.clipPath = poly;
                    this.leftPage.getElement().style.webkitClipPath = poly;
                  }
                } else {
                  const p1 = calc.topIntersectPoint;
                  const p2 = calc.sideIntersectPoint || calc.bottomIntersectPoint;
                  if (p1 && p2) {
                    const lx1 = W - p1.x;
                    const lx2 = W - p2.x;
                    const poly = `polygon(${W}px 0px, ${W}px ${H}px, 0px ${H}px, ${lx2.toFixed(1)}px ${p2.y.toFixed(1)}px, ${lx1.toFixed(1)}px ${p1.y.toFixed(1)}px)`;
                    this.leftPage.getElement().style.clipPath = poly;
                    this.leftPage.getElement().style.webkitClipPath = poly;
                  }
                }
              }
            }

            // When not flipping, reset clip-path on static left and right pages
            if (!this.flippingPage) {
              if (this.leftPage) {
                this.leftPage.getElement().style.clipPath = "";
                this.leftPage.getElement().style.webkitClipPath = "";
              }
              if (this.rightPage) {
                this.rightPage.getElement().style.clipPath = "";
                this.rightPage.getElement().style.webkitClipPath = "";
              }
            }
          };
        }

        updateShift(0);
        setTimeout(initCoverShine, 120);
        restLoupe();
      });

      pf.on("flip", (e: { data: number }) => {
        if (!isMounted) return;
        const page = typeof e.data === "number" ? e.data : 0;
        let sIdx = 0;
        if (page === 0) sIdx = 0;
        else if (page <= 2) sIdx = 1;
        else if (page <= 4) sIdx = 2;
        else sIdx = 3;

        stateIndexRef.current = sIdx;
        setStateIndex(sIdx);
        updateShift(sIdx);

        if (loupeImgRef.current) {
          loupeImgRef.current.src = BOOK_SPREADS[sIdx].spreadUrl;
        }
        placeLoupe();

        if (sIdx === 0) {
          setTimeout(initCoverShine, 120);
        } else {
          shineTlRef.current?.kill();
          shineTlRef.current = null;
        }

        soundManager.playThwip();
      });

      pf.on("changeState", (e: { data: string }) => {
        if (e.data === "user_fold" || e.data === "flipping") {
          shoveLoupe();
          if (shineTlRef.current) {
            shineTlRef.current.pause();
          }
        } else if (e.data === "read") {
          if (shineTlRef.current && stateIndexRef.current === 0) {
            shineTlRef.current.resume();
          }
        }
      });
    };

    setupBook();

    return () => {
      isMounted = false;
      shineTlRef.current?.kill();
      if (pageFlipInstance) {
        try {
          pageFlipInstance.destroy();
        } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Loupe Dragging ---------------- */
  useEffect(() => {
    const loupe = loupeRef.current;
    if (!loupe) return;

    const onLoupeDown = (e: PointerEvent) => {
      const v = viewRef.current;
      if (!v.loupeOn || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      gsap.killTweensOf(v);
      v.lgrab = { cx: e.clientX, cy: e.clientY, lx0: v.lx || 0, ly0: v.ly || 0 };
      loupe.classList.add("held");
    };

    const onLoupeMove = (e: PointerEvent) => {
      const v = viewRef.current;
      if (!v.lgrab) return;
      const section = sectionRef.current;
      const secW = section ? section.clientWidth : window.innerWidth;
      const secH = section ? section.clientHeight : window.innerHeight;
      const D = loupeSize();
      const R = D / 2;

      const dx = e.clientX - v.lgrab.cx;
      const dy = e.clientY - v.lgrab.cy;

      const minX = R * 0.4;
      const maxX = secW + R * 0.9;
      const minY = R * 0.4;
      const maxY = secH - R * 0.4;

      v.lx = Math.max(minX, Math.min(maxX, v.lgrab.lx0 + dx));
      v.ly = Math.max(minY, Math.min(maxY, v.lgrab.ly0 + dy));
      placeLoupe();
    };

    const onLoupeUp = () => {
      if (viewRef.current.lgrab) {
        viewRef.current.lgrab = null;
        loupe.classList.remove("held");

        const dock = getDockPosition();
        gsap.to(viewRef.current, {
          lx: dock.x,
          ly: dock.y,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: placeLoupe,
        });
      }
    };

    loupe.addEventListener("pointerdown", onLoupeDown);
    window.addEventListener("pointermove", onLoupeMove);
    window.addEventListener("pointerup", onLoupeUp);
    window.addEventListener("pointercancel", onLoupeUp);

    return () => {
      loupe.removeEventListener("pointerdown", onLoupeDown);
      window.removeEventListener("pointermove", onLoupeMove);
      window.removeEventListener("pointerup", onLoupeUp);
      window.removeEventListener("pointercancel", onLoupeUp);
    };
  }, [getDockPosition, loupeSize, placeLoupe]);

  /* ---------------- Global Listeners ---------------- */
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tiltTo(e.clientX, e.clientY);
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        viewRef.current.rx = 0;
        viewRef.current.ry = 0;
        applyView();
      }
    };

    const handleResize = () => {
      viewRef.current.lx = null;
      restLoupe();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      e.preventDefault();
      if (e.key === "ArrowRight") handleArrowClick("next");
      else handleArrowClick("prev");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", onKeyDown);

    applyView();
    restLoupe();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [applyView, handleArrowClick, restLoupe, tiltTo]);

  const handleResetZoom = () => {
    setView(0, 0, 1);
  };

  const hasNext = stateIndex < TOTAL_STATES - 1;
  const hasPrev = stateIndex > 0;

  return (
    <section
      ref={sectionRef}
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

      {/* A4 BOOK STAGE (StPageFlip Dynamic Conic Peel & Drag Engine)              */}
      {/* ========================================================================= */}
      <div ref={wrapRef} className="sb-wrap" id="sbWrap">
        <div ref={stageRef} className="sb-stage" id="sbStage" onDoubleClick={handleResetZoom}>
          <div ref={sb3dRef} className="sb-3d" id="sb3d">
            <div ref={tiltRef} className="sb-tilt" id="sbTilt">
              {/* Soft Ambient & Contact Drop Shadows */}
              <div className="sb-cast ambient" aria-hidden="true" />
              <div className="sb-cast contact" aria-hidden="true" />

              {/* Dynamic StPageFlip Book Container */}
              <div ref={bookRef} className="sb-book" id="sbBook" />

              {/* Turn Indicator White Arrow (Matching User's Reference with Spacing Gap) */}
              {/* Bottom-Left Curved Arrow (Flip Back) */}
              {hasPrev && (
                <button
                  type="button"
                  className="sb-turn-arrow bottom-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArrowClick("prev");
                  }}
                  aria-label="Previous Page"
                  title="Turn to Previous Page"
                >
                  <FlipArrowSvg flipped />
                </button>
              )}

              {/* Bottom-Right Curved Arrow (Flip Forward) */}
              {hasNext && (
                <button
                  type="button"
                  className="sb-turn-arrow bottom-right"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArrowClick("next");
                  }}
                  aria-label="Next Page"
                  title="Turn to Next Page"
                >
                  <FlipArrowSvg />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Physical Loupe (Magnifying Glass) docked on the right side of the screen */}
      <div ref={loupeRef} className="loupe on" id="loupe">
        <span className="grip" />
        <span className="ring">
          <span className="lens" id="loupeLens">
            <div className="sb-lens-view">
              <img
                ref={loupeImgRef}
                src={BOOK_SPREADS[stateIndex].spreadUrl}
                alt=""
                className="sb-lens-img"
                draggable={false}
              />
            </div>
          </span>
        </span>
      </div>
    </section>
  );
};
