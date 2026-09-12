"use client";

import React, { useEffect, useRef } from "react";

interface BgFluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  radius: number;
  turbulence: number;
}

interface FluidBgCanvasProps {
  imageSrc?: string;
  baseOpacity?: number;
  revealOpacity?: number;
  className?: string;
}

export const FluidBgCanvas: React.FC<FluidBgCanvasProps> = ({
  imageSrc = "/assets/bg_web.png",
  baseOpacity = 0.02,
  revealOpacity = 0.45,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const particlesRef = useRef<BgFluidParticle[]>([]);
  const mouseRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    prevX: number;
    prevY: number;
  }>({
    x: -2000,
    y: -2000,
    active: false,
    prevX: -2000,
    prevY: -2000,
  });

  useEffect(() => {
    // 1. Load Background Spider Web Image
    const img = new window.Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 2. Setup Offscreen Canvases
    const maskCanvas = document.createElement("canvas");
    maskCanvasRef.current = maskCanvas;

    const webCanvas = document.createElement("canvas");
    webCanvasRef.current = webCanvas;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: false });
    const webCtx = webCanvas.getContext("2d", { willReadFrequently: false });
    if (!ctx || !maskCtx || !webCtx) return;

    let animId: number;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);

      canvas.width = w;
      canvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;
      webCanvas.width = w;
      webCanvas.height = h;
    };

    resize();
    window.addEventListener("resize", resize);

    // 3. Fluid Ghost Particle Generator for Background Web Reveal
    const addFluidPoints = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const xNorm = (clientX - rect.left) / rect.width;
      const yNorm = (clientY - rect.top) / rect.height;

      const cx = xNorm * canvas.width;
      const cy = yNorm * canvas.height;

      if (mouseRef.current.prevX === -2000) {
        mouseRef.current.prevX = cx;
        mouseRef.current.prevY = cy;
      } else {
        mouseRef.current.prevX = mouseRef.current.x;
        mouseRef.current.prevY = mouseRef.current.y;
      }

      mouseRef.current.x = cx;
      mouseRef.current.y = cy;
      mouseRef.current.active = true;

      const dx = cx - mouseRef.current.prevX;
      const dy = cy - mouseRef.current.prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.min(12, Math.max(3, Math.floor(speed / 10)));

      const scale = canvas.width / 1000;

      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const px = mouseRef.current.prevX + dx * t;
        const py = mouseRef.current.prevY + dy * t;

        const spread = 45 * scale;
        particlesRef.current.push({
          x: px + (Math.random() - 0.5) * spread,
          y: py + (Math.random() - 0.5) * spread,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8 - 0.4,
          age: 0,
          maxAge: 55 + Math.random() * 35,
          radius: (110 + Math.random() * 70) * scale,
          turbulence: (Math.random() - 0.5) * 0.06,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      addFluidPoints(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        addFluidPoints(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        addFluidPoints(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.prevX = -2000;
      mouseRef.current.prevY = -2000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("touchend", handleLeave);

    // 4. Render Loop with Organic Fluid Smoke Mask
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      maskCtx.clearRect(0, 0, w, h);
      webCtx.clearRect(0, 0, w, h);

      if (!imgRef.current) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Step A: Draw Ultra-Faint Baseline Web Texture
      if (baseOpacity > 0) {
        drawCoverImage(ctx, imgRef.current, w, h, baseOpacity);
      }

      // Step B: Build Fluid Ghost Smoke Alpha Mask into maskCanvas
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += p.turbulence;
        p.radius += 1.3; // Organic fluid smoke expansion

        const progress = p.age / p.maxAge;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        // Soft sinusoidal alpha curve (ethereal smoke dissipation)
        const alpha = Math.sin((1 - progress) * Math.PI * 0.5);

        const grad = maskCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * alpha})`);
        grad.addColorStop(0.4, `rgba(255, 255, 255, ${0.65 * alpha})`);
        grad.addColorStop(0.75, `rgba(255, 255, 255, ${0.18 * alpha})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        maskCtx.fillStyle = grad;
        maskCtx.beginPath();
        maskCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        maskCtx.fill();
      }

      // Active pointer core (soft fluid center directly beneath cursor)
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const coreRad = 140 * (w / 1000);
        const coreGrad = maskCtx.createRadialGradient(mx, my, 0, mx, my, coreRad);
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        coreGrad.addColorStop(0.45, "rgba(255, 255, 255, 0.82)");
        coreGrad.addColorStop(0.78, "rgba(255, 255, 255, 0.28)");
        coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        maskCtx.fillStyle = coreGrad;
        maskCtx.beginPath();
        maskCtx.arc(mx, my, coreRad, 0, Math.PI * 2);
        maskCtx.fill();
      }

      // Step C: Draw Bright Web Image into webCanvas & Mask with Fluid Smoke
      drawCoverImage(webCtx, imgRef.current, w, h, revealOpacity);
      webCtx.globalCompositeOperation = "destination-in";
      webCtx.drawImage(maskCanvas, 0, 0);
      webCtx.globalCompositeOperation = "source-over";

      // Step D: Composite the revealed web onto main canvas
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(webCanvas, 0, 0);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("touchend", handleLeave);
      cancelAnimationFrame(animId);
    };
  }, [imageSrc, baseOpacity, revealOpacity]);

  function drawCoverImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasW: number,
    canvasH: number,
    opacity = 1.0
  ) {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasW / canvasH;

    let drawW: number;
    let drawH: number;
    let drawX: number;
    let drawY: number;

    if (canvasRatio > imgRatio) {
      drawW = canvasW;
      drawH = drawW / imgRatio;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    } else {
      drawH = canvasH;
      drawW = drawH * imgRatio;
      drawX = (canvasW - drawW) / 2;
      drawY = 0;
    }

    ctx.globalAlpha = opacity;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.globalAlpha = 1.0;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};
