"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Volume2, VolumeX } from "lucide-react";
import { soundManager } from "@/lib/sound";

export const StickyHeader: React.FC = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    return soundManager.subscribe((isPlaying) => {
      setSoundOn(isPlaying);
    });
  }, []);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
      );
    }
  }, []);

  const handleToggleSound = () => {
    soundManager.toggleBgm();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-5 sm:px-10 lg:px-14 pt-5 sm:pt-8 flex items-start justify-between pointer-events-none select-none">
      {/* Bold GG Logo with dot + Increased Still... Graphic */}
      <div
        ref={logoRef}
        className="cursor-pointer group flex flex-col items-start pointer-events-auto"
        onClick={() => soundManager.playThwip()}
      >
        <div className="flex items-baseline gap-1">
          <Image
            src="/assets/gg_logo.png"
            alt="GG Logo"
            width={320}
            height={160}
            priority
            className="w-24 sm:w-36 lg:w-48 h-auto object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(0,240,255,0.6)] group-hover:scale-105 transition-all duration-300"
          />
          <span className="text-red-500 font-editorial font-black text-3xl sm:text-5xl lg:text-6xl leading-none drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
            .
          </span>
        </div>

        <div className="mt-2 sm:mt-3">
          <Image
            src="/assets/still.png"
            alt="Still..."
            width={340}
            height={114}
            priority
            className="w-32 sm:w-48 lg:w-60 h-auto object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all duration-300"
          />
        </div>
      </div>

      {/* Minimalist Sound Toggle */}
      <button
        onClick={handleToggleSound}
        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 pointer-events-auto ${
          soundOn
            ? "border-cyan-400/80 bg-cyan-950/60 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400/50"
            : "border-black/10 bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 hover:border-black/20"
        }`}
        title={soundOn ? "Audio: ON (Click to Mute)" : "Audio: MUTED (Click to Unmute)"}
        aria-label={soundOn ? "Mute audio" : "Unmute audio"}
      >
        {soundOn ? (
          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50" />
        )}
      </button>
    </header>
  );
};
