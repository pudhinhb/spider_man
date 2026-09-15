"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Moon, Sun, Shield, Terminal } from "lucide-react";
import { soundManager } from "@/lib/sound";

export const Navbar: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    return soundManager.subscribe((isEnabled) => {
      setSoundEnabled(isEnabled);
    });
  }, []);

  useEffect(() => {
    // Check initial dark mode preference
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleSound = () => {
    soundManager.toggleBgm();
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
    soundManager.playHudBeep(1000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/75 dark:bg-[#09090c]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => soundManager.playThwip()}>
          <div className="relative w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
            {/* Spider icon glyph */}
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current transition-transform duration-300 group-hover:rotate-12"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tighter text-base sm:text-lg text-zinc-900 dark:text-white font-sans">
                GG<span className="text-red-600">.</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded border border-red-200 dark:border-red-900/50">
                v2.6 SPIDER-SYS
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider">
              FULL-STACK ARCHITECT // NYC 07
            </p>
          </div>
        </div>

        {/* Tactical Status Badge */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
            STATUS: <span className="text-emerald-600 dark:text-emerald-400">READY FOR MISSIONS</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "Disable sound effects" : "Enable sound effects"}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            title={soundEnabled ? "Spider Sound FX: ON" : "Spider Sound FX: MUTED"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-red-600" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-60" />
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            title="Toggle theme (Light / Dark Spider-Verse)"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* Quick Signal CTA */}
          <a
            href="#contact"
            onClick={() => soundManager.playThwip()}
            className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-600/30 transition-all hover:shadow-md hover:shadow-red-600/50 active:scale-95"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SIGNAL ARCHITECT</span>
            <span className="sm:hidden">CONTACT</span>
          </a>
        </div>
      </div>
    </header>
  );
};
