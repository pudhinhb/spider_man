"use client";

import React, { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  radius: number;
}

interface FluidTrailMaskProps {
  onMaskUpdate?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}

export const FluidTrailMask: React.FC<FluidTrailMaskProps> = ({
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const lastMouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * 0.75));
      canvas.height = Math.max(1, Math.floor(rect.height * 0.75));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const handlePointerMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        lastMouseRef.current = {
          x: x * canvas.width,
          y: y * canvas.height,
          active: true,
        };

        // Add fluid smoke particle points
        const count = 3;
        for (let i = 0; i < count; i++) {
          const spread = 20;
          pointsRef.current.push({
            x: x * canvas.width + (Math.random() - 0.5) * spread,
            y: y * canvas.height + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.5,
            age: 0,
            maxAge: 45 + Math.random() * 25,
            radius: 40 + Math.random() * 35,
          });
        }
      } else {
        lastMouseRef.current.active = false;
      }
    };

    const handlePointerLeave = () => {
      lastMouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handlePointerMove);
    parent.addEventListener("mouseleave", handlePointerLeave);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
        p.radius += 0.8; // Expand smoke blob over time

        const progress = p.age / p.maxAge;
        if (progress >= 1) {
          points.splice(i, 1);
          continue;
        }

        const alpha = Math.sin((1 - progress) * Math.PI * 0.5);

        // Draw soft feathered radial smoke gradient
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * alpha})`);
        grad.addColorStop(0.4, `rgba(255, 255, 255, ${0.5 * alpha})`);
        grad.addColorStop(0.75, `rgba(255, 255, 255, ${0.18 * alpha})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // If mouse is active, ensure a strong soft blob directly under current pointer
      if (lastMouseRef.current.active) {
        const mx = lastMouseRef.current.x;
        const my = lastMouseRef.current.y;
        const coreGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 75);
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        coreGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.6)");
        coreGrad.addColorStop(0.85, "rgba(255, 255, 255, 0.2)");
        coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 75, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      parent.removeEventListener("mouseleave", handlePointerLeave);
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ display: "none" }}
    />
  );
};
