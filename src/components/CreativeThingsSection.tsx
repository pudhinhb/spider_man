"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export interface FontOption {
  id: string;
  label: string;
  fontFamily: string;
  fontSizeClass: string;
  letterSpacing?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "sora",
    label: "Sora Geometric",
    fontFamily: "var(--font-sora), sans-serif",
    fontSizeClass: "text-2xl sm:text-3xl md:text-4xl lg:text-[3.2rem] font-semibold",
    letterSpacing: "-0.02em",
  },
  {
    id: "handwritten",
    label: "Handwritten",
    fontFamily: "var(--font-handwritten), 'Permanent Marker', cursive",
    fontSizeClass: "text-2xl sm:text-3xl md:text-4xl lg:text-[3.2rem]",
    letterSpacing: "0.02em",
  },
  {
    id: "marvel",
    label: "Marvel Font",
    fontFamily: "var(--font-marvel), var(--font-bebas), sans-serif",
    fontSizeClass: "text-2xl sm:text-3xl md:text-4xl lg:text-[3.4rem] uppercase font-bold",
    letterSpacing: "0.05em",
  },
  {
    id: "sketch",
    label: "Sketch Type",
    fontFamily: "var(--font-sketch), cursive, sans-serif",
    fontSizeClass: "text-2xl sm:text-3xl md:text-4xl lg:text-[3.1rem]",
    letterSpacing: "0.03em",
  },
  {
    id: "editorial",
    label: "Editorial Serif",
    fontFamily: "var(--font-editorial), var(--font-playfair), Georgia, serif",
    fontSizeClass: "text-2xl sm:text-3xl md:text-4xl lg:text-[3.3rem]",
    letterSpacing: "-0.02em",
  },
  {
    id: "cyber",
    label: "Cyber Grotesk",
    fontFamily: "var(--font-syne), var(--font-space), sans-serif",
    fontSizeClass: "text-2xl sm:text-3xl md:text-4xl lg:text-[2.9rem] font-bold",
    letterSpacing: "-0.03em",
  },
];

// 16 Unique Fonts for the dynamic "Ganesh" name (Famous movie title fonts + Tamil font 3rd)
export const GANESH_FONTS = [
  {
    name: "Sora Sleek",
    style: "var(--font-sora), sans-serif",
    className: "font-semibold",
    fontSize: "1.0em",
    text: "Ganesh",
  },
  {
    name: "Marvel Cinematic",
    style: "var(--font-marvel), sans-serif",
    className: "font-bold tracking-wider",
    fontSize: "1.04em",
    text: "GANESH",
  },
  {
    name: "Anek Tamil",
    style: "var(--font-anek-tamil), sans-serif",
    className: "font-bold tracking-wide",
    fontSize: "1.02em",
    text: "கணேஷ்", // 3rd in sequence: Authentic Tamil script!
  },
  {
    name: "Spider-Verse Marker",
    style: "var(--font-handwritten), 'Permanent Marker', cursive",
    className: "font-semibold",
    fontSize: "0.94em",
    text: "Ganesh",
  },
  {
    name: "Gladiator Epic",
    style: "var(--font-cinzel), serif",
    className: "font-bold tracking-wide",
    fontSize: "0.96em",
    text: "Ganesh",
  },
  {
    name: "Tron Cyberpunk",
    style: "var(--font-orbitron), sans-serif",
    className: "font-bold tracking-wider",
    fontSize: "0.9em",
    text: "Ganesh",
  },
  {
    name: "Money Heist Action",
    style: "var(--font-bebas), sans-serif",
    className: "font-semibold tracking-widest",
    fontSize: "1.05em",
    text: "GANESH",
  },
  {
    name: "Stranger Things 80s",
    style: "var(--font-righteous), cursive",
    className: "font-semibold",
    fontSize: "0.96em",
    text: "Ganesh",
  },
  {
    name: "Hollywood Classic",
    style: "var(--font-pacifico), cursive",
    className: "font-semibold",
    fontSize: "0.9em",
    text: "Ganesh",
  },
  {
    name: "Arcade Retro 8-Bit",
    style: "var(--font-silkscreen), monospace",
    className: "font-bold",
    fontSize: "0.86em",
    text: "Ganesh",
  },
  {
    name: "Great Gatsby Luxury",
    style: "var(--font-playfair), Georgia, serif",
    className: "italic font-semibold",
    fontSize: "1.02em",
    text: "Ganesh",
  },
  {
    name: "Tim Burton Gothic",
    style: "var(--font-sketch), cursive",
    className: "font-bold",
    fontSize: "1.0em",
    text: "Ganesh",
  },
  {
    name: "Neo-Noir Cinema",
    style: "var(--font-syne), sans-serif",
    className: "font-bold tracking-wide",
    fontSize: "0.96em",
    text: "Ganesh",
  },
  {
    name: "Matrix Terminal",
    style: "var(--font-geist-mono), monospace",
    className: "font-mono font-bold",
    fontSize: "0.94em",
    text: "Ganesh",
  },
  {
    name: "Indie Romance Script",
    style: "var(--font-caveat), cursive",
    className: "font-bold",
    fontSize: "1.12em",
    text: "Ganesh",
  },
  {
    name: "Interstellar Space",
    style: "var(--font-space-grotesk), sans-serif",
    className: "font-bold tracking-tight",
    fontSize: "0.96em",
    text: "Ganesh",
  },
];

export const DESIGNER_FONTS = GANESH_FONTS;

// Color conversion utilities for authentic Figma Color Picker
export function hexToHsv(hex: string, fallbackHue = 0): { h: number; s: number; v: number } {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  if (cleanHex.length !== 6) {
    return { h: fallbackHue, s: 0, v: 0 };
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = fallbackHue;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (d !== 0) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = h * 60;
  }

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

export function hsvToHex(h: number, s: number, v: number): string {
  s = s / 100;
  v = v / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h <= 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const val = Math.round((n + m) * 255);
    return val.toString(16).padStart(2, "0");
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Authentic Apple-Style Squircle White Color Picker Card Component (Matching Reference Image)
interface SquircleColorPickerProps {
  currentColor: string;
  onChange: (hex: string) => void;
  onClose?: () => void;
}

export const SquircleColorPicker: React.FC<SquircleColorPickerProps> = ({
  currentColor,
  onChange,
  onClose,
}) => {
  const initialHsv = hexToHsv(currentColor);
  const [h, setH] = useState(initialHsv.h);
  const [s, setS] = useState(initialHsv.s);
  const [v, setV] = useState(initialHsv.v);
  const [alpha, setAlpha] = useState(100);
  const [hexInput, setHexInput] = useState(
    currentColor.replace("#", "").toUpperCase()
  );

  useEffect(() => {
    const newHsv = hexToHsv(currentColor, h);
    setH(newHsv.h);
    setS(newHsv.s);
    setV(newHsv.v);
    setHexInput(currentColor.replace("#", "").toUpperCase());
  }, [currentColor]);

  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  // 2D Saturation / Value Area Dragging
  const handleMouseDownArea = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const area = areaRef.current;
    if (!area) return;

    const update = (clientX: number, clientY: number) => {
      const rect = area.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const newS = Math.round((x / rect.width) * 100);
      const newV = Math.round((1 - y / rect.height) * 100);
      setS(newS);
      setV(newV);
      const newHex = hsvToHex(h, newS, newV);
      setHexInput(newHex.replace("#", "").toUpperCase());
      onChange(newHex);
    };

    update(e.clientX, e.clientY);

    const onMouseMove = (ev: MouseEvent) => update(ev.clientX, ev.clientY);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Hue Slider Dragging
  const handleMouseDownHue = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const hueEl = hueRef.current;
    if (!hueEl) return;

    const update = (clientX: number) => {
      const rect = hueEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const newH = Math.round((x / rect.width) * 360);
      setH(newH);
      const newHex = hsvToHex(newH, s, v);
      setHexInput(newHex.replace("#", "").toUpperCase());
      onChange(newHex);
    };

    update(e.clientX);

    const onMouseMove = (ev: MouseEvent) => update(ev.clientX);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Alpha Slider Dragging
  const handleMouseDownAlpha = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const alphaEl = alphaRef.current;
    if (!alphaEl) return;

    const update = (clientX: number) => {
      const rect = alphaEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const newAlpha = Math.round((x / rect.width) * 100);
      setAlpha(newAlpha);
    };

    update(e.clientX);

    const onMouseMove = (ev: MouseEvent) => update(ev.clientX);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Eyedropper API
  const handleEyedropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const picked = result.sRGBHex;
          const newHsv = hexToHsv(picked, h);
          setH(newHsv.h);
          setS(newHsv.s);
          setV(newHsv.v);
          setHexInput(picked.replace("#", "").toUpperCase());
          onChange(picked);
        }
      } catch {
        // cancelled
      }
    }
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6).toUpperCase();
    setHexInput(val);
    if (val.length === 6) {
      const full = "#" + val;
      const newHsv = hexToHsv(full, h);
      setH(newHsv.h);
      setS(newHsv.s);
      setV(newHsv.v);
      onChange(full);
    }
  };

  const activeColorHex = hsvToHex(h, s, v);

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="w-[272px] rounded-[28px] bg-white border border-black/[0.08] p-4 select-none text-left z-50 transition-all duration-200"
      style={{
        boxShadow:
          "0 24px 52px -12px rgba(0, 0, 0, 0.16), 0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* 1. 2D Color Saturation & Brightness Box with Concentric Smooth Squircle Radius */}
      <div
        ref={areaRef}
        onMouseDown={handleMouseDownArea}
        className="w-full h-[142px] rounded-[18px] relative overflow-hidden cursor-crosshair select-none"
        style={{
          backgroundColor: `hsl(${h}, 100%, 50%)`,
        }}
      >
        {/* White horizontal gradient (saturation) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0))",
          }}
        />
        {/* Black vertical gradient (brightness) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, #000000, rgba(0, 0, 0, 0))",
          }}
        />
        {/* Crisp White Circular Ring Handle matching reference image */}
        <div
          className="absolute w-[20px] h-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.38)] pointer-events-none"
          style={{
            left: `${s}%`,
            top: `${100 - v}%`,
          }}
        />
      </div>

      {/* 2. Eyedropper + Dual Sliders Section */}
      <div className="flex items-center gap-2.5 mt-3.5 mb-3.5 px-0.5">
        {/* Eyedropper Button */}
        <button
          type="button"
          onClick={handleEyedropper}
          className="text-zinc-500 hover:text-zinc-900 transition-colors p-1 shrink-0 rounded-full hover:bg-black/[0.04]"
          title="Pick color from screen"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2l4 4L7 17H3v-4L14 2z" />
            <path d="M12 4l4 4" />
            <path d="M3 21l3-3" />
          </svg>
        </button>

        {/* Sliders Stack */}
        <div className="flex-1 flex flex-col gap-2.5">
          {/* Rainbow Hue Slider */}
          <div
            ref={hueRef}
            onMouseDown={handleMouseDownHue}
            className="w-full h-[10px] rounded-full relative cursor-pointer select-none"
            style={{
              background:
                "linear-gradient(to right, #ff3b30, #ff9500, #ffcc00, #34c759, #00c7be, #007aff, #5856d6, #af52de, #ff2d55, #ff3b30)",
            }}
          >
            <div
              className="absolute top-1/2 w-[18px] h-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] pointer-events-none flex items-center justify-center"
              style={{
                left: `${(h / 360) * 100}%`,
              }}
            >
              <div
                className="w-[8px] h-[8px] rounded-full"
                style={{ backgroundColor: `hsl(${h}, 100%, 50%)` }}
              />
            </div>
          </div>

          {/* Opacity / Alpha Slider */}
          <div
            ref={alphaRef}
            onMouseDown={handleMouseDownAlpha}
            className="w-full h-[10px] rounded-full relative cursor-pointer select-none overflow-visible"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 8px 8px",
            }}
          >
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `linear-gradient(to right, rgba(0,0,0,0), ${activeColorHex})`,
              }}
            />
            <div
              className="absolute top-1/2 w-[18px] h-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] pointer-events-none flex items-center justify-center"
              style={{
                left: `${alpha}%`,
              }}
            >
              <div
                className="w-[8px] h-[8px] rounded-full"
                style={{ backgroundColor: activeColorHex }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Hex ↕ Pill | #858585 Pill | 100% Pill with unified squircle curves */}
      <div className="flex items-center gap-1.5">
        {/* Hex Dropdown Pill */}
        <button
          type="button"
          className="h-8 rounded-full border border-black/10 bg-white hover:bg-zinc-50 px-3 flex items-center gap-1.5 text-[12px] font-semibold text-zinc-700 shadow-sm transition-colors shrink-0"
        >
          <span>Hex</span>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3.5 4.5L6 2l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.5 7.5L6 10l2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Hex Code Input Pill */}
        <div className="h-8 rounded-full border border-black/10 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 px-3 flex items-center shadow-sm flex-1 transition-all">
          <span className="text-zinc-400 font-mono text-[12px] mr-0.5">#</span>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            maxLength={6}
            className="w-full bg-transparent border-none outline-none text-[12px] font-mono font-medium text-zinc-800 tracking-wider text-center"
            placeholder="858585"
          />
        </div>

        {/* Opacity Percentage Pill */}
        <div className="h-8 rounded-full border border-black/10 bg-white px-3 flex items-center justify-center text-[12px] font-medium text-zinc-800 shadow-sm w-16 shrink-0">
          <span>{alpha}%</span>
        </div>
      </div>
    </div>
  );
};

// Backwards compatibility alias
export const FigmaColorPicker = SquircleColorPicker;

// 6 Collaborative Multiplayer Cursors (Spread across Section 3)
export const AI_CURSORS = [
  {
    id: "vignesh",
    name: "Vignesh",
    color: "#8b5cf6", // Electric Violet
    pointerAngle: 0,
    posClass: "absolute top-[9%] left-[6%] sm:left-[10%]",
    fromX: -140,
    fromY: -100,
    steps: [
      { x: 30, y: 15, moveDur: 1.1, pauseDur: 2.0 },
      { x: 50, y: -10, moveDur: 1.2, pauseDur: 2.2 },
      { x: 15, y: 10, moveDur: 1.0, pauseDur: 1.9 },
    ],
  },
  {
    id: "wesley",
    name: "Wesley",
    color: "#0d99ff", // Figma Royal Blue
    pointerAngle: 0,
    posClass: "absolute top-[8%] right-[7%] sm:right-[12%]",
    fromX: 140,
    fromY: -90,
    steps: [
      { x: -30, y: -15, moveDur: 1.2, pauseDur: 2.3 },
      { x: 20, y: 10, moveDur: 1.0, pauseDur: 1.8 },
      { x: -15, y: 5, moveDur: 1.3, pauseDur: 2.1 },
    ],
  },
  {
    id: "monisha",
    name: "Monisha",
    color: "#ec4899", // Vibrant Pink
    pointerAngle: 0,
    posClass: "absolute top-[7%] left-[30%] sm:left-[36%]",
    fromX: 30,
    fromY: -130,
    steps: [
      { x: 25, y: -15, moveDur: 1.0, pauseDur: 1.9 },
      { x: -25, y: -10, moveDur: 1.1, pauseDur: 2.4 },
      { x: 10, y: 15, moveDur: 0.9, pauseDur: 2.0 },
    ],
  },
  {
    id: "pudhin",
    name: "Pudhin",
    color: "#10b981", // Emerald Green
    pointerAngle: 0,
    posClass: "absolute bottom-[16%] left-[6%] sm:left-[12%]",
    fromX: -130,
    fromY: 110,
    steps: [
      { x: 45, y: -20, moveDur: 1.3, pauseDur: 2.1 },
      { x: 20, y: -45, moveDur: 1.0, pauseDur: 2.0 },
      { x: 10, y: -10, moveDur: 1.1, pauseDur: 1.8 },
    ],
  },
  {
    id: "muthu",
    name: "Muthu",
    color: "#eab308", // Cyber Yellow
    textColor: "text-white font-bold",
    pointerAngle: 0,
    posClass: "absolute bottom-[16%] right-[6%] sm:right-[14%]",
    fromX: 150,
    fromY: 120,
    steps: [
      { x: -35, y: -25, moveDur: 1.1, pauseDur: 2.2 },
      { x: -60, y: -10, moveDur: 1.2, pauseDur: 1.9 },
      { x: -15, y: 20, moveDur: 1.0, pauseDur: 2.3 },
    ],
  },
  {
    id: "sameer",
    name: "Sameer",
    color: "#06b6d4", // Electric Cyan
    pointerAngle: 0,
    posClass: "absolute top-[40%] right-[7%] sm:right-[13%]",
    fromX: 130,
    fromY: 70,
    steps: [
      { x: -40, y: 35, moveDur: 1.1, pauseDur: 2.0 },
      { x: 20, y: -30, moveDur: 1.2, pauseDur: 2.3 },
      { x: -30, y: -20, moveDur: 1.0, pauseDur: 1.9 },
    ],
  },
];

export const CreativeThingsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLSpanElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fontBtnRef = useRef<HTMLButtonElement>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const figmaFrameRef = useRef<HTMLDivElement>(null);
  const underlineBtnRef = useRef<HTMLButtonElement>(null);
  const sketchUnderlineRef = useRef<HTMLDivElement>(null);
  const cursorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasStoryPlayedRef = useRef(false);

  // Line 2 Formatting State — Starts in Sora Geometric, then converted live by AI storyboard!
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONT_OPTIONS[0]); // Sora Geometric
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#111111"); // Onyx Black

  // 16 Fonts Random Rotator for "Ganesh" name on Line 1 (Including authentic Tamil font)
  const [ganeshFontIndex, setGaneshFontIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setGaneshFontIndex((prev) => (prev + 1) % GANESH_FONTS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Popover menus & Focus state
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // User collaborative cursor state ("You" in Red)
  const [isHoveringSection, setIsHoveringSection] = useState(false);
  const userCursorRef = useRef<HTMLDivElement>(null);

  // Spidey Hi interactive sticker refs & trigger
  const spideyStickerRef = useRef<HTMLImageElement>(null);
  const avatarEllipseRef = useRef<HTMLSpanElement>(null);
  const isSpideyActiveRef = useRef(false);
  const spideyTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const triggerSpideySticker = () => {
    if (isSpideyActiveRef.current) return;
    const spidey = spideyStickerRef.current;
    if (!spidey) return;

    isSpideyActiveRef.current = true;

    if (spideyTimelineRef.current) {
      spideyTimelineRef.current.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        isSpideyActiveRef.current = false;
      },
    });
    spideyTimelineRef.current = tl;

    // Pop out from behind the letter H of "Hi,"
    tl.fromTo(
      spidey,
      { x: 32, opacity: 0, scale: 0.85 },
      { x: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" }
    );

    // Subtle cute waving animation
    tl.to(spidey, {
      rotation: -4,
      duration: 0.18,
      yoyo: true,
      repeat: 3,
      ease: "sine.inOut",
    });

    // Stays for ~3.4s so viewer can enjoy Spidey saying Hi!
    tl.to({}, { duration: 3.2 });

    // Falls off naturally: loses grip on the H stem, slips down & fades away
    tl.to(spidey, {
      y: "+=130",
      x: "-=18",
      rotation: 20,
      opacity: 0,
      duration: 0.68,
      ease: "power2.in",
    });

    // Reset properties for next click
    tl.set(spidey, {
      opacity: 0,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
    });
  };

  // "See my brain" & "You need this?" interactive paper sticker state & refs
  const [stickerType, setStickerType] = useState<"see-my-brain" | "you-need-this">("see-my-brain");
  const mindWordRef = useRef<HTMLSpanElement>(null);
  const brainStickerRef = useRef<HTMLDivElement>(null);
  const stickerTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isStickerActiveRef = useRef(false);

  const triggerBrainSticker = (type: "see-my-brain" | "you-need-this" = "you-need-this") => {
    if (isStickerActiveRef.current) return;
    const sticker = brainStickerRef.current;
    if (!sticker) return;

    isStickerActiveRef.current = true;
    setStickerType(type);

    if (stickerTimelineRef.current) {
      stickerTimelineRef.current.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        isStickerActiveRef.current = false;
      },
    });
    stickerTimelineRef.current = tl;

    // STEP 1: Paper Slap onto the canvas above "mind" (NO SHADOW)
    tl.set(sticker, {
      opacity: 0,
      scale: 1.35,
      rotation: -14,
      rotateX: 30,
      rotateY: -18,
      skewX: -5,
      y: -24,
      x: 0,
    });

    // Tactile rapid slap-down against paper
    tl.to(sticker, {
      opacity: 1,
      scale: 0.94,
      rotation: -3,
      rotateX: -6,
      rotateY: 4,
      skewX: 2,
      y: 0,
      duration: 0.22,
      ease: "power3.out",
    });

    // Elastic paper rebound vibration
    tl.to(sticker, {
      scale: 1.02,
      rotation: -1,
      rotateX: 4,
      rotateY: -2,
      duration: 0.16,
      ease: "power2.out",
    });

    tl.to(sticker, {
      scale: 1.0,
      rotation: -1,
      rotateX: 0,
      rotateY: 0,
      skewX: 0,
      duration: 0.3,
      ease: "power1.out",
    });

    // STEP 2: Stays firmly placed
    // Holds 3.0s for Sameer's automated demo, 4.0s for viewer hover
    const holdDuration = type === "see-my-brain" ? 3.0 : 4.0;

    tl.to(
      sticker,
      {
        rotateX: 18,
        rotateY: -10,
        rotation: -2,
        y: -3,
        duration: 0.7,
        ease: "power1.inOut",
      },
      `+=${holdDuration}`
    );

    // STEP 3: NATURAL FALL WITH SLIGHT AIR SWING (NO SHADOW)
    // Corner gently unglues:
    tl.to(sticker, {
      rotateX: 22,
      rotateY: -12,
      rotation: -4,
      y: -6,
      duration: 0.2,
      ease: "power1.out",
    });

    // Air Swing 1: Glides gently down & slightly right, tilting softly on the breeze
    tl.to(sticker, {
      y: "+=52",
      x: "+=16",
      rotation: 8,
      rotateX: -10,
      rotateY: 12,
      duration: 0.46,
      ease: "sine.inOut",
    });

    // Air Swing 2: Catches slight air resistance and sways gently back to the left
    tl.to(sticker, {
      y: "+=64",
      x: "-=22",
      rotation: -7,
      rotateX: 14,
      rotateY: -10,
      duration: 0.50,
      ease: "sine.inOut",
    });

    // Air Swing 3: Soft graceful descent into the air, fading out smoothly
    tl.to(sticker, {
      y: "+=78",
      x: "+=14",
      rotation: 10,
      rotateX: 25,
      rotateY: 8,
      opacity: 0,
      duration: 0.58,
      ease: "power1.in",
    });

    tl.set(sticker, {
      opacity: 0,
      scale: 1,
      rotation: 0,
      rotateX: 0,
      rotateY: 0,
      skewX: 0,
      y: 0,
      x: 0,
    });
  };

  // User cursor mouse tracking in Section 3 & "mind" crossing detector
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      setIsHoveringSection(true);
      if (userCursorRef.current) {
        userCursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if user cursor crosses the word "mind" or the side sticker area
      if (mindWordRef.current && !isStickerActiveRef.current) {
        const rect = mindWordRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left - 20 &&
          e.clientX <= rect.right + 70 &&
          e.clientY >= rect.top - 20 &&
          e.clientY <= rect.bottom + 25
        ) {
          triggerBrainSticker("you-need-this");
        }
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      setIsHoveringSection(true);
      if (userCursorRef.current) {
        userCursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseLeave = () => {
      setIsHoveringSection(false);
    };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseenter", handleMouseEnter);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseenter", handleMouseEnter);
      section.removeEventListener("mouseleave", handleMouseLeave);
      if (stickerTimelineRef.current) {
        stickerTimelineRef.current.kill();
      }
      if (spideyTimelineRef.current) {
        spideyTimelineRef.current.kill();
      }
    };
  }, []);

  // Scroll Trigger Entrance Animation & Cursor Storyboard
  useEffect(() => {
    const section = sectionRef.current;
    const titleContainer = titleContainerRef.current;
    const toolbar = toolbarRef.current;
    if (!section || !titleContainer || !toolbar) return;

    const ctx = gsap.context(() => {
      // Stable entrance without Y drift to ensure rock-solid pixel targeting
      gsap.fromTo(
        titleContainer.children,
        {
          opacity: 0,
          scale: 0.98,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        toolbar,
        {
          scale: 0.94,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.75,
          delay: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Function to start the step-pause-step wander loop for any cursor
      const startWander = (cursorEl: HTMLElement, item: (typeof AI_CURSORS)[0]) => {
        const wanderTl = gsap.timeline({ repeat: -1 });
        item.steps.forEach((step) => {
          wanderTl.to(cursorEl, {
            x: step.x,
            y: step.y,
            duration: step.moveDur,
            ease: "power2.out",
          });
          wanderTl.to({}, { duration: step.pauseDur });
        });
        wanderTl.to(cursorEl, {
          x: 0,
          y: 0,
          duration: 1.2,
          ease: "power2.inOut",
        });
        wanderTl.to({}, { duration: 2.0 });
      };

      // =========================================================================
      // MASTER SEQUENCED STORYBOARD TRIGGERED ON ENTERING SECTION 3
      // 1. Jarvis arrives & creates the frame
      // 2. Karen arrives, EXACTLY touches font button & selects Handwritten
      // 3. Ultron arrives, EXACTLY touches color button & selects Red
      // 4. All 5 cursors enter spread-out multiplayer pause-wander loop
      // =========================================================================
      const runStoryboard = () => {
        if (hasStoryPlayedRef.current) return;
        hasStoryPlayedRef.current = true;

        const vigneshEl = cursorRefs.current[0];
        const wesleyEl = cursorRefs.current[1];
        const monishaEl = cursorRefs.current[2];
        const pudhinEl = cursorRefs.current[3];
        const muthuEl = cursorRefs.current[4];
        const sameerEl = cursorRefs.current[5];
        const figmaFrame = figmaFrameRef.current;
        const editable = editableRef.current;
        const fontBtn = fontBtnRef.current || document.getElementById("toolbar-font-btn");
        const colorBtn = colorBtnRef.current || document.getElementById("toolbar-color-btn");

        if (!figmaFrame || !editable || !fontBtn || !colorBtn) return;

        // Accurate arrow tip delta calculator (sharp arrow tip is at +3.8px, +2.2px)
        const getTargetDelta = (
          cursorEl: HTMLElement,
          targetEl: HTMLElement,
          targetPoint: "center" | "top-right" = "center"
        ) => {
          const cursorRect = cursorEl.getBoundingClientRect();
          const targetRect = targetEl.getBoundingClientRect();

          let destX = targetRect.left + targetRect.width / 2;
          let destY = targetRect.top + targetRect.height / 2;

          if (targetPoint === "top-right") {
            // Top-right handle of figma selection frame
            destX = targetRect.right;
            destY = targetRect.top;
          }

          const currentTipX = cursorRect.left + 3.8;
          const currentTipY = cursorRect.top + 2.2;

          const currentX = (gsap.getProperty(cursorEl, "x") as number) || 0;
          const currentY = (gsap.getProperty(cursorEl, "y") as number) || 0;

          return {
            x: currentX + (destX - currentTipX),
            y: currentY + (destY - currentTipY),
          };
        };

        const story = gsap.timeline();

        // ACT 0: MONISHA ENTERS AND CLICKS THE AVATAR ELLIPSE TO REVEAL SPIDEY HI STICKER!
        if (monishaEl) {
          const avatarEllipse = avatarEllipseRef.current;
          if (avatarEllipse) {
            const monishaDelta = getTargetDelta(monishaEl, avatarEllipse, "center");

            // Monisha glides in from top to hover on avatar ellipse
            story.fromTo(
              monishaEl,
              { x: monishaDelta.x + 50, y: monishaDelta.y - 130, opacity: 0, scale: 0.7 },
              {
                x: monishaDelta.x,
                y: monishaDelta.y - 28, // points directly onto the top edge of the avatar ellipse
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "power2.out",
              },
              0.1
            );

            // Monisha clicks the avatar ellipse at 0.92s!
            story.to(
              monishaEl,
              { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" },
              0.92
            );

            story.to(
              avatarEllipse,
              { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" },
              0.92
            );

            // Spidey sticker pops out from behind "H" of "Hi,"!
            story.add(() => {
              triggerSpideySticker();
            }, 0.95);

            // Monisha admires Spidey, then glides to her designated spot and starts gentle wandering
            story.to(
              monishaEl,
              {
                x: 0,
                y: 0,
                duration: 1.1,
                ease: "power2.inOut",
                onComplete: () => startWander(monishaEl, AI_CURSORS[2]),
              },
              1.6
            );
          }
        }

        // ACT 1: WESLEY ENTERS AND CREATES THE FIGMA FRAME ON THE EDITOR TEXT
        if (wesleyEl) {
          const wesleyDelta = getTargetDelta(wesleyEl, figmaFrame, "top-right");

          story.fromTo(
            wesleyEl,
            { x: wesleyDelta.x + 150, y: wesleyDelta.y - 120, opacity: 0, scale: 0.7 },
            {
              x: wesleyDelta.x,
              y: wesleyDelta.y,
              opacity: 1,
              scale: 1,
              duration: 1.1,
              ease: "power2.out",
            },
            0.3
          );

          // Wesley clicks and creates the frame!
          story.to(wesleyEl, { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" }, 1.45);
          story.fromTo(
            figmaFrame,
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" },
            1.5
          );

          // Wesley glides smoothly to his designated top-right quadrant
          story.to(
            wesleyEl,
            {
              x: 0,
              y: 0,
              duration: 1.1,
              ease: "power2.inOut",
              onComplete: () => startWander(wesleyEl, AI_CURSORS[1]),
            },
            2.0
          );
        }

        // ACT 2: PUDHIN ENTERS, EXACTLY TOUCHES FONT BUTTON & SELECTS HANDWRITTEN
        if (pudhinEl) {
          const pudhinDelta = getTargetDelta(pudhinEl, fontBtn, "center");

          story.fromTo(
            pudhinEl,
            { x: pudhinDelta.x - 140, y: pudhinDelta.y + 120, opacity: 0, scale: 0.7 },
            {
              x: pudhinDelta.x,
              y: pudhinDelta.y,
              opacity: 1,
              scale: 1,
              duration: 1.1,
              ease: "power2.inOut",
            },
            2.1
          );

          // Pudhin arrow tip touches and clicks fontBtn!
          story.to(pudhinEl, { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" }, 3.25);

          // Button depresses with tactile feedback & ring
          story.to(
            fontBtn,
            {
              scale: 0.92,
              duration: 0.09,
              yoyo: true,
              repeat: 1,
              onStart: () => fontBtn.classList.add("ring-2", "ring-emerald-500/40", "bg-black/[0.06]"),
              onComplete: () => fontBtn.classList.remove("ring-2", "ring-emerald-500/40", "bg-black/[0.06]"),
            },
            3.25
          );

          // Font transforms live to Handwritten
          const handwrittenFont =
            FONT_OPTIONS.find((f) => f.id === "handwritten") || FONT_OPTIONS[1];
          story.add(() => {
            if (editableRef.current) {
              editableRef.current.style.fontFamily = handwrittenFont.fontFamily;
              editableRef.current.style.letterSpacing = handwrittenFont.letterSpacing || "0.02em";
              gsap.fromTo(editableRef.current, { scale: 0.95 }, { scale: 1, duration: 0.35, ease: "back.out(2)" });
            }
            const fontLabel = document.getElementById("toolbar-font-label");
            if (fontLabel) {
              fontLabel.textContent = handwrittenFont.label;
            }
            setSelectedFont(handwrittenFont); // Handwritten
          }, 3.35);

          // Pudhin pauses to admire the edit
          story.to({}, { duration: 0.35 }, 3.4);

          // Pudhin glides smoothly to designated lower-left quadrant
          story.to(
            pudhinEl,
            {
              x: 0,
              y: 0,
              duration: 1.1,
              ease: "power2.inOut",
              onComplete: () => startWander(pudhinEl, AI_CURSORS[3]),
            },
            3.75
          );
        }

        // ACT 3: MUTHU ENTERS, EXACTLY TOUCHES COLOR BUTTON & CHANGES TEXT COLOR TO YELLOW
        if (muthuEl) {
          const muthuDelta = getTargetDelta(muthuEl, colorBtn, "center");

          story.fromTo(
            muthuEl,
            { x: muthuDelta.x + 140, y: muthuDelta.y + 120, opacity: 0, scale: 0.7 },
            {
              x: muthuDelta.x,
              y: muthuDelta.y,
              opacity: 1,
              scale: 1,
              duration: 1.1,
              ease: "power2.inOut",
            },
            4.0
          );

          // Muthu arrow tip touches and clicks colorBtn!
          story.to(muthuEl, { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" }, 5.15);

          // Color button depresses with tactile feedback & ring
          story.to(
            colorBtn,
            {
              scale: 0.92,
              duration: 0.09,
              yoyo: true,
              repeat: 1,
              onStart: () => colorBtn.classList.add("ring-2", "ring-yellow-400/60", "bg-black/[0.06]"),
              onComplete: () => colorBtn.classList.remove("ring-2", "ring-yellow-400/60", "bg-black/[0.06]"),
            },
            5.15
          );

          // Color transforms live to Cyber Yellow (#eab308)
          story.add(() => {
            if (editableRef.current) {
              editableRef.current.style.color = "#eab308";
              editableRef.current.style.caretColor = "#eab308";
              gsap.fromTo(editableRef.current, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: "back.out(2)" });
            }
            const colorIcon = document.getElementById("toolbar-color-icon");
            if (colorIcon) {
              colorIcon.style.backgroundColor = "#eab308";
            }
            setSelectedColor("#eab308"); // Yellow!
          }, 5.25);

          // Muthu pauses to admire color change
          story.to({}, { duration: 0.35 }, 5.3);

          // Muthu glides smoothly to designated lower-right quadrant
          story.to(
            muthuEl,
            {
              x: 0,
              y: 0,
              duration: 1.1,
              ease: "power2.inOut",
              onComplete: () => startWander(muthuEl, AI_CURSORS[4]),
            },
            5.65
          );
        }

        // ACT 4: VIGNESH ENTERS AFTER MUTHU, EXACTLY TOUCHES UNDERLINE BUTTON & APPLIES SKETCH STROKE UNDERLINE
        if (vigneshEl) {
          const underlineBtn =
            underlineBtnRef.current || document.getElementById("toolbar-underline-btn");

          if (underlineBtn) {
            const vigneshDelta = getTargetDelta(vigneshEl, underlineBtn, "center");

            // Vignesh glides smoothly into the toolbar option box right after Muthu finishes
            story.fromTo(
              vigneshEl,
              { x: vigneshDelta.x - 140, y: vigneshDelta.y - 110, opacity: 0, scale: 0.7 },
              {
                x: vigneshDelta.x,
                y: vigneshDelta.y,
                opacity: 1,
                scale: 1,
                duration: 1.05,
                ease: "power2.inOut",
              },
              5.75
            );

            // Vignesh arrow tip touches and clicks underlineBtn!
            story.to(
              vigneshEl,
              { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" },
              6.8
            );

            // Button depresses with tactile feedback & violet ring
            story.to(
              underlineBtn,
              {
                scale: 0.92,
                duration: 0.09,
                yoyo: true,
                repeat: 1,
                onStart: () =>
                  underlineBtn.classList.add("ring-2", "ring-violet-500/50", "bg-black/[0.06]"),
                onComplete: () =>
                  underlineBtn.classList.remove("ring-2", "ring-violet-500/50", "bg-black/[0.06]"),
              },
              6.8
            );

            // Authentic Sketch Stroke Underline draws live under "designing"!
            story.add(() => {
              setIsUnderline(true);
              if (sketchUnderlineRef.current) {
                gsap.fromTo(
                  sketchUnderlineRef.current,
                  { scaleX: 0.05, opacity: 0, transformOrigin: "left center" },
                  { scaleX: 1, opacity: 1, duration: 0.42, ease: "power2.out" }
                );
              }
            }, 6.9);

            // Vignesh pauses to admire the hand-drawn sketch stroke
            story.to({}, { duration: 0.35 }, 7.0);

            // Vignesh glides smoothly to his designated top-left quadrant and starts gentle wandering
            story.to(
              vigneshEl,
              {
                x: 0,
                y: 0,
                duration: 1.1,
                ease: "power2.inOut",
                onComplete: () => startWander(vigneshEl, AI_CURSORS[0]),
              },
              7.35
            );
          }
        }

        // ACT 5: SAMEER ENTERS AFTER VIGNESH, HOVERS EXACTLY OVER "MIND", THEN MOVES FULL RIGHT!
        if (sameerEl) {
          const mindWord = mindWordRef.current;
          if (mindWord) {
            const sameerDelta = getTargetDelta(sameerEl, mindWord, "center");

            // Step 1: Sameer glides smoothly from offscreen to hover EXACTLY on the "mind" text
            story.fromTo(
              sameerEl,
              { x: sameerDelta.x + 220, y: sameerDelta.y + 90, opacity: 0, scale: 0.7 },
              {
                x: sameerDelta.x,
                y: sameerDelta.y + 2,
                opacity: 1,
                scale: 1,
                duration: 1.0,
                ease: "power2.inOut",
              },
              7.5
            );

            // Sameer hovers directly on "mind" at 8.5s!
            // Word "mind" turns red and the "See my brain" sticker slaps on!
            story.add(() => {
              mindWord.classList.add("text-red-600");
              triggerBrainSticker("see-my-brain");
            }, 8.5);

            // Sameer does a little tactile hover pulse
            story.to(
              sameerEl,
              { scale: 0.84, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" },
              8.52
            );

            // Step 2: Sameer sweeps FULLY to the right edge of the screen (past 3rd dot column from right)
            story.add(() => {
              const sectionWidth = sectionRef.current?.getBoundingClientRect().width || window.innerWidth;
              // Target: right edge minus ~90px (≈3rd dot column at 32px spacing)
              const sameerRect = sameerEl.getBoundingClientRect();
              const sameerCurrentX = (gsap.getProperty(sameerEl, "x") as number) || 0;
              const targetScreenX = sectionWidth - 90;
              const deltaToRight = sameerCurrentX + (targetScreenX - (sameerRect.left + 4));
              gsap.to(sameerEl, {
                x: deltaToRight,
                y: sameerDelta.y + 12,
                duration: 0.9,
                ease: "power2.out",
              });
            }, 8.75);

            // Sameer un-hovers "mind" after sweep is complete — then stays parked on the right
            story.add(() => {
              mindWord.classList.remove("text-red-600");
            }, 9.9);
            // Sameer stays on the right side — no return, no wander
          }
        }
      };

      // Trigger storyboard on scroll or immediately if section is already in viewport
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        const timer = setTimeout(() => {
          runStoryboard();
        }, 150);
        return () => clearTimeout(timer);
      } else {
        ScrollTrigger.create({
          trigger: section,
          start: "top 72%",
          onEnter: () => runStoryboard(),
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Format togglers
  const toggleBold = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && editableRef.current?.contains(sel.anchorNode)) {
      document.execCommand("bold");
    } else {
      setIsBold((prev) => !prev);
    }
  };

  const toggleItalic = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && editableRef.current?.contains(sel.anchorNode)) {
      document.execCommand("italic");
    } else {
      setIsItalic((prev) => !prev);
    }
  };

  const toggleUnderline = () => {
    setIsUnderline((prev) => {
      const next = !prev;
      if (next && sketchUnderlineRef.current) {
        gsap.fromTo(
          sketchUnderlineRef.current,
          { scaleX: 0.1, opacity: 0, transformOrigin: "left center" },
          { scaleX: 1, opacity: 1, duration: 0.38, ease: "back.out(1.8)" }
        );
      }
      return next;
    });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (editableRef.current) {
      editableRef.current.style.color = color;
      editableRef.current.style.caretColor = color;
    }
    const colorIcon = document.getElementById("toolbar-color-icon");
    if (colorIcon) {
      colorIcon.style.backgroundColor = color;
    }
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && editableRef.current?.contains(sel.anchorNode)) {
      document.execCommand("foreColor", false, color);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setFontMenuOpen(false);
        setColorMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="creative-section"
      className={`relative w-full min-h-screen bg-transparent text-black flex flex-col justify-center items-center px-4 sm:px-8 py-20 sm:py-28 overflow-visible select-none ${
        isHoveringSection ? "creative-canvas-cursor" : ""
      }`}
      style={{
        backgroundColor: "transparent",
      }}
    >
      {/* Seamless blend gradient connector at the top */}
      <div
        className="absolute top-0 left-0 w-full h-24 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
        }}
      />

      {/* 5 Collaborative Marvel / Spidey AI Multiplayer Cursors (Spread across Section 3 Canvas) */}
      <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
        {AI_CURSORS.map((cursor, idx) => (
          <div
            key={cursor.id}
            ref={(el) => {
              cursorRefs.current[idx] = el;
            }}
            className={`${cursor.posClass} flex items-start gap-1 pointer-events-none opacity-0 select-none`}
          >
            {/* Figma Pointer Arrow */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={cursor.color}
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] flex-shrink-0"
              style={{
                transform: `rotate(${cursor.pointerAngle}deg)`,
              }}
            >
              <path d="M5.65 3.35L19.4 9.1c.95.4 1 1.74.07 2.22l-4.7 2.45-2.45 4.7c-.48.93-1.82.88-2.22-.07L4.35 4.65c-.34-.8.5-1.64 1.3-.3z" />
            </svg>

            {/* Figma User Name Badge */}
            <div
              className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-sans font-semibold tracking-wide shadow-[0_2px_8px_rgba(0,0,0,0.18)] whitespace-nowrap leading-tight ${
                (cursor as any).textColor || "text-white"
              }`}
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </div>
          </div>
        ))}
      </div>

      {/* Collaborative User Multiplayer Cursor ("You" in Red) */}
      <div
        ref={userCursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-50 flex items-start gap-1 select-none transition-opacity duration-150 ${
          isHoveringSection ? "opacity-100" : "opacity-0"
        }`}
        style={{
          willChange: "transform",
        }}
      >
        {/* Figma Pointer Arrow in Red */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
          className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] flex-shrink-0"
        >
          <path d="M5.65 3.35L19.4 9.1c.95.4 1 1.74.07 2.22l-4.7 2.45-2.45 4.7c-.48.93-1.82.88-2.22-.07L4.35 4.65c-.34-.8.5-1.64 1.3-.3z" />
        </svg>

        {/* Figma "You" Name Badge in Red */}
        <div className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-sans font-semibold text-white tracking-wide shadow-[0_2px_8px_rgba(239,68,68,0.35)] whitespace-nowrap leading-tight bg-[#ef4444]">
          You
        </div>
      </div>

      {/* Main Typography Stage (Minimized & Compact) */}
      <div
        ref={titleContainerRef}
        className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center my-auto"
      >
        {/* Line 1: Symmetrically Center-Aligned Headline with Static Avatar Anchor */}
        <h2 className="w-full font-sora text-[#111111] font-semibold tracking-[-0.03em] leading-[1.12] select-none text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] flex items-center justify-center">
          {/* Left Wing: "Hi, I'm" with Spidey peeking sticker right on the H (Matches Image 1 reference) */}
          <span className="flex-1 flex items-center justify-end pr-2.5 sm:pr-3.5 md:pr-4 whitespace-nowrap overflow-visible">
            <span className="relative inline-flex items-baseline">
              {/* Spidey Peeking Sticker hugging the H stem (Triggers via avatar click or Monisha) */}
              <span className="relative inline-block">
                <img
                  ref={spideyStickerRef}
                  src="/assets/Spidey peeking.png"
                  alt="Spidey Hi"
                  className="absolute right-full mr-[-3px] sm:mr-[-4px] md:mr-[-5px] bottom-[-2px] sm:bottom-[-3px] md:bottom-[-4px] h-[58px] sm:h-[86px] md:h-[108px] lg:h-[120px] w-auto max-w-none pointer-events-none select-none z-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.14)] opacity-0"
                />
                Hi,
              </span>
              <span>&nbsp;I’m</span>
            </span>
          </span>

          {/* Center Anchor: Avatar Ellipse (Clicking triggers Spidey Hi sticker to peek & wave!) */}
          <span
            ref={avatarEllipseRef}
            id="avatar-ellipse-btn"
            onClick={triggerSpideySticker}
            className="relative inline-flex items-center justify-center align-middle w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-[5.2rem] lg:h-[5.2rem] rounded-full overflow-hidden bg-gradient-to-tr from-[#b91c1c] via-[#ef4444] to-[#f87171] p-[2.5px] shadow-[0_8px_24px_rgba(239,68,68,0.38),0_2px_6px_rgba(0,0,0,0.1)] border-2 border-white transition-transform hover:scale-110 active:scale-95 duration-300 group cursor-pointer flex-shrink-0 z-10"
            title="Click to say Hi to Spidey!"
          >
            <span className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center bg-gradient-to-b from-[#ef4444] to-[#991b1b]">
              <img
                src="/assets/GG no background.png"
                alt="Ganesh"
                className="w-full h-full object-cover object-top scale-110 translate-y-1 drop-shadow-md pointer-events-none"
              />
            </span>
          </span>

          {/* Right Wing: Dedicated Left-Aligned Name Slot */}
          <span className="flex-1 flex items-center justify-start pl-2.5 sm:pl-3.5 md:pl-4 overflow-visible">
            <span
              key={ganeshFontIndex}
              className={`inline-block text-[#111111] transition-opacity duration-200 text-left whitespace-nowrap ${GANESH_FONTS[ganeshFontIndex].className}`}
              style={{
                fontFamily: GANESH_FONTS[ganeshFontIndex].style,
                fontSize: GANESH_FONTS[ganeshFontIndex].fontSize,
              }}
            >
              {GANESH_FONTS[ganeshFontIndex].text || "Ganesh"}
            </span>
          </span>
        </h2>

        {/* Line 2: "A designer with a curious mind" with interactive sticker trigger on "mind" */}
        <div className="font-sora text-[#111111] font-semibold tracking-[-0.02em] leading-[1.25] select-none text-2xl sm:text-3xl md:text-4xl lg:text-[3.2rem] mt-2 sm:mt-3 text-center relative inline-block">
          <span>A designer with a curious </span>
          <span
            ref={mindWordRef}
            onMouseEnter={() => triggerBrainSticker("you-need-this")}
            className="relative inline-block cursor-pointer group"
          >
            <span className="relative z-10 transition-colors duration-200 group-hover:text-red-600">
              mind
            </span>

            {/* Interactive Paper Die-Cut Sticker: Side placement immediately beside "mind" (Matching User Reference Image) */}
            <div
              ref={brainStickerRef}
              className="absolute left-full -ml-2 sm:-ml-2.5 md:-ml-3 bottom-[-4px] sm:bottom-[-6px] md:bottom-[-8px] pointer-events-none z-40 select-none opacity-0"
              style={{
                perspective: "1200px",
                transformOrigin: "left center",
              }}
            >
              <div
                className="relative w-28 sm:w-32 md:w-36 lg:w-40 transition-transform"
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src={
                    stickerType === "you-need-this"
                      ? "/assets/Youn need this.png"
                      : "/assets/See my brain.png"
                  }
                  alt={stickerType === "you-need-this" ? "You need this?" : "See my brain"}
                  className="w-full h-auto object-contain pointer-events-none select-none"
                />
              </div>
            </div>
          </span>
        </div>

        {/* Line 3: "Still [designing] my origin story." with frame and editable specifically on "designing" */}
        <div className="relative mt-3 sm:mt-4 flex flex-col items-center max-w-full">
          {/* Main Line 3 Sentence Container */}
          <div className="relative inline-flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 text-2xl sm:text-3xl md:text-4xl lg:text-[3.3rem] font-sora font-semibold text-[#111111] tracking-[-0.02em] leading-[1.2]">
            <span>Still</span>

            {/* The Authentic Figma Selection Box specifically wrapping "designing" */}
            <div className="relative inline-flex items-center justify-center">
              <div
                ref={figmaFrameRef}
                className={`relative px-3 sm:px-4 py-0.5 sm:py-1 border-[1.5px] border-[#0d99ff] bg-transparent opacity-0 transition-all duration-150 ${
                  isFocused ? "ring-2 ring-[#0d99ff]/20" : ""
                }`}
              >
                {/* 4 Corner Resize Handles (White Squares with Blue Border) */}
                <div className="absolute -top-[4.5px] -left-[4.5px] w-[7px] h-[7px] bg-white border-[1.5px] border-[#0d99ff] pointer-events-none" />
                <div className="absolute -top-[4.5px] -right-[4.5px] w-[7px] h-[7px] bg-white border-[1.5px] border-[#0d99ff] pointer-events-none" />
                <div className="absolute -bottom-[4.5px] -left-[4.5px] w-[7px] h-[7px] bg-white border-[1.5px] border-[#0d99ff] pointer-events-none" />
                <div className="absolute -bottom-[4.5px] -right-[4.5px] w-[7px] h-[7px] bg-white border-[1.5px] border-[#0d99ff] pointer-events-none" />

                {/* 4 Midpoint Edge Handles */}
                <div className="absolute top-1/2 -left-[4.5px] -translate-y-1/2 w-[7px] h-[7px] bg-white border-[1.5px] border-[#0d99ff] pointer-events-none" />
                <div className="absolute top-1/2 -right-[4.5px] -translate-y-1/2 w-[7px] h-[7px] bg-white border-[1.5px] border-[#0d99ff] pointer-events-none" />
                <div className="absolute -top-[4.5px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] bg-white border-[1.5px] border-[#0d99ff] pointer-events-none" />
                <div className="absolute -bottom-[4.5px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] bg-white border-[1.5px] border-[#0d99ff] pointer-events-none" />

                {/* The single live editable text with dynamic font family */}
                <span
                  ref={editableRef}
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`outline-none select-text cursor-text transition-colors duration-150 inline-block min-w-[5ch] relative z-10 ${
                    isBold ? "font-bold" : "font-semibold"
                  } ${isItalic ? "italic" : "not-italic"}`}
                  style={{
                    fontFamily: selectedFont.fontFamily,
                    letterSpacing: selectedFont.letterSpacing || "normal",
                    color: selectedColor,
                    caretColor: selectedColor,
                  }}
                >
                  designing
                </span>

                {/* Authentic Hand-Drawn Sketch Stroke Underline (Exact Sketch stroke.svg) */}
                <div
                  ref={sketchUnderlineRef}
                  className={`absolute -left-[4%] -bottom-2 sm:-bottom-3 w-[108%] pointer-events-none transition-all duration-300 z-15 ${
                    isUnderline ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  style={{
                    transformOrigin: "left center",
                  }}
                >
                  <svg
                    viewBox="0 0 1401 155"
                    fill="none"
                    preserveAspectRatio="none"
                    className="w-full h-3.5 sm:h-4.5 md:h-5 drop-shadow-sm overflow-visible"
                    style={{
                      color: selectedColor,
                    }}
                  >
                    <path
                      d="M595.703 151.932C588.312 151.694 580.401 151.831 574.185 147.223C566.268 142.469 566.883 129.489 575.332 125.612C592.798 117.685 612.61 116.82 631.222 112.879C855.473 77.7203 1081.27 52.5143 1307.39 32.8993C1137.64 23.2313 967.305 25.0033 797.324 25.7013C585.09 28.6923 372.064 38.8994 162.554 74.6434C113.981 84.2214 62.6053 91.2785 18.1883 113.047C8.26828 117.909 -3.01274 108.351 0.737265 97.9603C1.70626 95.2743 3.59527 92.8523 6.53527 91.2013C43.9383 70.5013 87.8143 64.8853 129.021 55.3343C324.991 19.0863 524.635 6.96126 723.606 1.97326C872.02 -1.29274 1020.5 -0.0667503 1168.92 2.48425C1234.76 3.48925 1300.73 5.30141 1366.08 13.8734C1374.26 15.2594 1382.78 15.8104 1390.54 18.8204C1393.24 19.8674 1395.71 21.4993 1397.55 23.7323C1406.98 35.1723 1391.15 46.6774 1371.9 51.0914C1149.88 102.021 918.392 95.0374 692.953 128.341C793.097 129.065 893.243 129.847 993.392 129.809C1000.21 129.797 1005.63 136.24 1005.36 142.824C1005.18 149.603 999.069 155.089 992.344 154.792C860.138 154.33 727.883 154.599 595.703 151.932Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <span>my origin story.</span>
          </div>
        </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* EXACT APPLE PRODUCT UI TOOLBAR BOX (Boxy Curve)            */}
          {/* [ Heading 1 ⌵  |  B   I   U  |  A ⌵ ]                      */}
          {/* ────────────────────────────────────────────────────────── */}
          <div
            ref={toolbarRef}
            id="creative-toolbar-box"
            className="mt-4 sm:mt-5 relative inline-flex items-center h-[38px] px-3 sm:px-3.5 rounded-[9px] bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] select-none z-30 transition-all duration-200"
          >
            {/* 1. Font Chooser / Heading Dropdown */}
            <div className="relative">
              <button
                ref={fontBtnRef}
                id="toolbar-font-btn"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setFontMenuOpen(!fontMenuOpen);
                  setColorMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] text-[14px] font-normal text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] transition-colors"
                title="Select Font"
              >
                <span id="toolbar-font-label" className="truncate max-w-[105px] sm:max-w-none tracking-[-0.01em]">
                  {selectedFont.label}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#86868b] transition-transform duration-200 ${
                    fontMenuOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2}
                />
              </button>

              {/* Apple Frosted Glass Dropdown (Opens Downside with Boxy Curve) */}
              {fontMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 rounded-[12px] bg-white/95 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.08] p-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-medium text-[#86868b] uppercase tracking-wider">
                    Font Styles
                  </div>
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedFont(font);
                        setFontMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl flex items-center justify-between text-[14px] transition-colors ${
                        selectedFont.id === font.id
                          ? "bg-black/[0.06] text-[#1d1d1f] font-medium"
                          : "text-[#1d1d1f] hover:bg-black/[0.04]"
                      }`}
                    >
                      <span
                        style={{ fontFamily: font.fontFamily }}
                        className="text-[15px] leading-tight"
                      >
                        {font.label}
                      </span>
                      {selectedFont.id === font.id && (
                        <Check className="w-3.5 h-3.5 text-[#1d1d1f] shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hairline Divider 1 */}
            <div className="w-[1px] h-3.5 bg-black/[0.12] mx-2" />

            {/* 2. Bold Button (B) — Matching Apple wireframe double-loop style */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleBold}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                isBold
                  ? "bg-black/[0.08] text-[#1d1d1f]"
                  : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.03]"
              }`}
              title="Bold"
            >
              <svg
                width="13"
                height="15"
                viewBox="0 0 13 15"
                fill="none"
                className="transition-colors"
              >
                <path
                  d="M2.5 1.5h4.5a3 3 0 010 6H2.5m0 0h5a3 3 0 010 6H2.5V1.5z"
                  stroke="currentColor"
                  strokeWidth={isBold ? "2.2" : "1.25"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 3. Italic Button (I) — Slender italic serif I */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleItalic}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                isItalic
                  ? "bg-black/[0.08] text-[#1d1d1f]"
                  : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.03]"
              }`}
              title="Italic"
            >
              <span
                className={`font-serif italic text-[15px] leading-none transition-colors ${
                  isItalic ? "font-bold" : "font-normal"
                }`}
              >
                I
              </span>
            </button>

            {/* 4. Underline Button (U) — Rounded U with separate underline bar */}
            <button
              ref={underlineBtnRef}
              id="toolbar-underline-btn"
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleUnderline}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                isUnderline
                  ? "bg-black/[0.08] text-[#1d1d1f]"
                  : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.03]"
              }`}
              title="Underline"
            >
              <svg
                width="13"
                height="15"
                viewBox="0 0 13 15"
                fill="none"
                className="transition-colors"
              >
                <path
                  d="M2.5 2v5a4 4 0 008 0V2"
                  stroke="currentColor"
                  strokeWidth={isUnderline ? "2" : "1.25"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="1.5"
                  y1="13.5"
                  x2="11.5"
                  y2="13.5"
                  stroke="currentColor"
                  strokeWidth={isUnderline ? "2" : "1.25"}
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Hairline Divider 2 */}
            <div className="w-[1px] h-3.5 bg-black/[0.12] mx-2" />

            {/* 5. Text Color Dropdown (A ⌵) — Apple bold sans-serif A with subtle chevron */}
            <div className="relative">
              <button
                ref={colorBtnRef}
                id="toolbar-color-btn"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setColorMenuOpen(!colorMenuOpen);
                  setFontMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-black/[0.04] active:bg-black/[0.08] transition-colors"
                title="Change Color"
              >
                <span
                  id="toolbar-color-icon"
                  className="w-4 h-4 rounded-full border border-black/15 shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-all flex-shrink-0"
                  style={{ backgroundColor: selectedColor }}
                />
                <ChevronDown
                  className={`w-3 h-3 text-[#86868b] transition-transform duration-200 ${
                    colorMenuOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2}
                />
              </button>

              {/* Authentic White Squircle Color Picker Card (Matches Reference Image) */}
              {colorMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 top-full mt-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <SquircleColorPicker
                    currentColor={selectedColor}
                    onChange={handleColorChange}
                    onClose={() => setColorMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Supporting Copy ── */}
          <div
            className="mt-5 sm:mt-6 w-full max-w-[860px] mx-auto px-4 sm:px-6 text-center"
            style={{ lineHeight: 1.4 }}
          >
            <p
              className="text-[13px] sm:text-[14px] font-normal text-[#6B7280] leading-snug"
            >
              I work across branding, graphic design, UI/UX, &amp; vibe coding—turning ideas into visuals &amp; experiences.
            </p>
            <p
              className="text-[13px] sm:text-[14px] font-normal italic text-[#6B7280] mt-1.5 leading-snug"
            >
              Give me the &lsquo;what if.&rsquo; I&rsquo;ll find the &lsquo;how.&rsquo;
            </p>
          </div>
        </div>
      </section>
  );
};
