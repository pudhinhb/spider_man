"use client";

import React, { useEffect, useRef } from "react";

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  radius: number;
  turbulence: number;
}

interface FluidSpideyCanvasProps {
  humanImageSrc?: string;
  spideyImageSrc?: string;
  isFullSuit?: boolean;
  isHovering?: boolean;
  className?: string;
}

export const FluidSpideyCanvas: React.FC<FluidSpideyCanvasProps> = ({
  humanImageSrc = "/assets/gg_human.png",
  spideyImageSrc = "/assets/gg_spidey.png",
  isFullSuit = false,
  isHovering = false,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spideyCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const humanImgRef = useRef<HTMLImageElement | null>(null);
  const spideyImgRef = useRef<HTMLImageElement | null>(null);

  const particlesRef = useRef<FluidParticle[]>([]);
  const lastMoveTimeRef = useRef<number>(0);
  const coreIntensityRef = useRef<number>(0);
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
    // 1. Load Human Developer Portrait (GG no background.png)
    const humanImg = new window.Image();
    humanImg.src = humanImageSrc;
    humanImg.crossOrigin = "anonymous";
    humanImg.onload = () => {
      humanImgRef.current = humanImg;
    };

    // 2. Load Spider-Man Suit Image (GGSpidey no backgound.png)
    const spideyImg = new window.Image();
    spideyImg.src = spideyImageSrc;
    spideyImg.crossOrigin = "anonymous";
    spideyImg.onload = () => {
      spideyImgRef.current = spideyImg;
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    // 3. Create Offscreen Canvases
    const maskCanvas = document.createElement("canvas");
    maskCanvasRef.current = maskCanvas;

    const spideyCanvas = document.createElement("canvas");
    spideyCanvasRef.current = spideyCanvas;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: false });
    const spideyCtx = spideyCanvas.getContext("2d", { willReadFrequently: false });
    if (!ctx || !maskCtx || !spideyCtx) return;

    let animId: number;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);

      canvas.width = w;
      canvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;
      spideyCanvas.width = w;
      spideyCanvas.height = h;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // 4. Fluid Ghost Particle Generator
    const addFluidPoints = (clientX: number, clientY: number) => {
      const rect = parent.getBoundingClientRect();
      const xNorm = (clientX - rect.left) / rect.width;
      const yNorm = (clientY - rect.top) / rect.height;

      if (xNorm >= -0.05 && xNorm <= 1.05 && yNorm >= -0.05 && yNorm <= 1.05) {
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
        lastMoveTimeRef.current = Date.now();
        coreIntensityRef.current = 1.0;

        const dx = cx - mouseRef.current.prevX;
        const dy = cy - mouseRef.current.prevY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.min(8, Math.max(2, Math.floor(speed / 15)));

        const scale = canvas.width / 650;

        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const px = mouseRef.current.prevX + dx * t;
          const py = mouseRef.current.prevY + dy * t;

          // Reduced spread and radius so hover animation is tighter and more focused
          const spread = 12 * scale;
          particlesRef.current.push({
            x: px + (Math.random() - 0.5) * spread,
            y: py + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2 - 0.4,
            age: 0,
            // Shorter particle lifespan for much faster return to original image
            maxAge: 18 + Math.random() * 12, // ~0.3 - 0.5s instead of 1.25s
            radius: (30 + Math.random() * 20) * scale, // reduced from 70-120 down to 30-50
            turbulence: (Math.random() - 0.5) * 0.05,
          });
        }
      } else {
        mouseRef.current.active = false;
        coreIntensityRef.current = 0;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      addFluidPoints(e.clientX, e.clientY);
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
      coreIntensityRef.current = 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        addFluidPoints(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    parent.addEventListener("mouseleave", handleLeave);
    parent.addEventListener("touchend", handleLeave);

    let fullSuitOpacity = isFullSuit ? 1 : 0;

    // 5. Render Loop with Dual-Layer Seamless Cross-Erase
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Full suit smooth fade transition
      if (isFullSuit) {
        fullSuitOpacity = Math.min(1, fullSuitOpacity + 0.05);
      } else {
        fullSuitOpacity = Math.max(0, fullSuitOpacity - 0.05);
      }

      ctx.clearRect(0, 0, w, h);
      maskCtx.clearRect(0, 0, w, h);
      spideyCtx.clearRect(0, 0, w, h);

      // Fast path: If full suit mode is 100%, render Spider-Man image directly
      if (fullSuitOpacity >= 0.99 && spideyImgRef.current) {
        drawContainedImage(ctx, spideyImgRef.current, w, h, 1.0);
        animId = requestAnimationFrame(render);
        return;
      }

      // Step A: Build Fluid Ghost Smoke Alpha Mask into maskCanvas
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += p.turbulence;
        p.radius += 0.35; // gentle, controlled fluid dissipation instead of ballooning

        const progress = p.age / p.maxAge;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        // Fast clean fade out curve
        const alpha = Math.sin((1 - progress) * Math.PI * 0.5);

        const grad = maskCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * alpha})`);
        grad.addColorStop(0.4, `rgba(255, 255, 255, ${0.6 * alpha})`);
        grad.addColorStop(0.75, `rgba(255, 255, 255, ${0.18 * alpha})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        maskCtx.fillStyle = grad;
        maskCtx.beginPath();
        maskCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        maskCtx.fill();
      }

      // Active pointer core (tight fluid center directly beneath cursor that fades when idle)
      const now = Date.now();
      const timeSinceMove = now - lastMoveTimeRef.current;
      if (timeSinceMove > 80) {
        // Rapid fade back to original image when cursor pauses or leaves
        coreIntensityRef.current = Math.max(0, coreIntensityRef.current - 0.06);
      }

      if (mouseRef.current.active && coreIntensityRef.current > 0.01) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        // Reduced core radius (44 instead of 100) for a precise, tight reveal
        const coreRad = 44 * (w / 650);
        const intensity = coreIntensityRef.current;

        const coreGrad = maskCtx.createRadialGradient(mx, my, 0, mx, my, coreRad);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${1.0 * intensity})`);
        coreGrad.addColorStop(0.4, `rgba(255, 255, 255, ${0.8 * intensity})`);
        coreGrad.addColorStop(0.75, `rgba(255, 255, 255, ${0.25 * intensity})`);
        coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        maskCtx.fillStyle = coreGrad;
        maskCtx.beginPath();
        maskCtx.arc(mx, my, coreRad, 0, Math.PI * 2);
        maskCtx.fill();
      }

      // Full suit transition layer
      if (fullSuitOpacity > 0) {
        maskCtx.fillStyle = `rgba(255, 255, 255, ${fullSuitOpacity})`;
        maskCtx.fillRect(0, 0, w, h);
      }

      // Step B: Mask the Spider-Man Suit into spideyCanvas
      if (spideyImgRef.current && w > 0 && h > 0 && maskCanvas.width > 0 && maskCanvas.height > 0) {
        drawContainedImage(spideyCtx, spideyImgRef.current, w, h, 1.0);
        spideyCtx.globalCompositeOperation = "destination-in";
        spideyCtx.drawImage(maskCanvas, 0, 0);
        spideyCtx.globalCompositeOperation = "source-over";
      }

      // Step C: Render Base Human Portrait & ERASE it where the mask is active!
      // (When cursor reveals the suit, the human image is cleanly removed underneath!)
      if (humanImgRef.current) {
        // Draw human image
        drawContainedImage(ctx, humanImgRef.current, w, h, 1.0);

        // Erase human image wherever the fluid ghost mask is active
        ctx.globalCompositeOperation = "destination-out";
        ctx.drawImage(maskCanvas, 0, 0);

        // Step D: Composite the masked Spider-Man suit onto the cutout
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(spideyCanvas, 0, 0);
      } else if (spideyImgRef.current) {
        // Fallback if human image not yet loaded
        ctx.drawImage(spideyCanvas, 0, 0);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      parent.removeEventListener("mouseleave", handleLeave);
      parent.removeEventListener("touchend", handleLeave);
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [humanImageSrc, spideyImageSrc, isFullSuit, isHovering]);

  // Helper function to draw image matching CSS object-contain object-bottom
  function drawContainedImage(
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
      drawH = canvasH;
      drawW = drawH * imgRatio;
      drawX = (canvasW - drawW) / 2;
      drawY = canvasH - drawH; // bottom anchored
    } else {
      drawW = canvasW;
      drawH = drawW / imgRatio;
      drawX = (canvasW - drawW) / 2;
      drawY = canvasH - drawH; // bottom anchored
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
