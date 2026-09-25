"use client";

import React, { useState, useEffect, useRef } from "react";

// Exact 14-bar symmetrical waveform silhouette matching the reference image
// Peaks at index 4 (5th bar) and index 10 (11th bar) with undulating intermediate waves
const WAVE_BARS = [
  { height: 12, anim: "music-wave-1", dur: 0.75, delay: 0.05 },
  { height: 24, anim: "music-wave-2", dur: 0.95, delay: 0.15 },
  { height: 18, anim: "music-wave-3", dur: 0.8, delay: 0.25 },
  { height: 10, anim: "music-wave-1", dur: 1.1, delay: 0.08 },
  { height: 38, anim: "music-wave-2", dur: 0.9, delay: 0.2 }, // Peak 1
  { height: 24, anim: "music-wave-3", dur: 0.85, delay: 0.12 },
  { height: 16, anim: "music-wave-1", dur: 0.7, delay: 0.3 },
  { height: 20, anim: "music-wave-2", dur: 1.0, delay: 0.18 },
  { height: 24, anim: "music-wave-3", dur: 0.8, delay: 0.22 },
  { height: 28, anim: "music-wave-1", dur: 0.92, delay: 0.1 },
  { height: 38, anim: "music-wave-2", dur: 0.88, delay: 0.28 }, // Peak 2
  { height: 22, anim: "music-wave-3", dur: 0.78, delay: 0.14 },
  { height: 14, anim: "music-wave-1", dur: 0.98, delay: 0.06 },
  { height: 10, anim: "music-wave-2", dur: 0.82, delay: 0.24 },
];

export const HeroMusicWave: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio instance for spiderman.mp3
    const audio = new Audio("/assets/spiderman.mp3");
    audio.loop = true;
    audio.volume = 0.75;
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Audio playback error:", err);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={togglePlay}
      className="group relative flex items-center justify-center h-12 px-4 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 hover:border-white/35 shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_12px_rgba(255,255,255,0.06)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
      title={isPlaying ? "Pause Spider-Man theme" : "Play Spider-Man theme"}
      aria-label={isPlaying ? "Pause theme music" : "Play theme music"}
    >
      {/* 14 Symmetrical White Music Wave Equalizer Lines */}
      <div className="flex items-center justify-center gap-[3px] sm:gap-[3.5px] h-[38px]">
        {WAVE_BARS.map((bar, idx) => (
          <span
            key={idx}
            className="w-[3px] sm:w-[3.5px] bg-white rounded-full transition-all duration-200 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{
              height: `${bar.height}px`,
              transformOrigin: "center",
              animation: isPlaying
                ? `${bar.anim} ${bar.dur}s ease-in-out ${bar.delay}s infinite alternate`
                : "none",
              transform: isPlaying ? undefined : "scaleY(1)",
            }}
          />
        ))}
      </div>

      {/* Subtle indicator badge on hover */}
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-mono tracking-wider uppercase text-white/75 pointer-events-none whitespace-nowrap">
        {isPlaying ? "PAUSE THEME" : "PLAY THEME"}
      </span>
    </button>
  );
};
