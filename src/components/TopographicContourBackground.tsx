"use client";

import React, { useEffect, useRef } from "react";

export const TopographicContourBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    // Number of contour rings/lines
    const rings = 12;

    const render = () => {
      time += 0.005;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.42;

      ctx.lineWidth = 1;

      // Draw elegant topographic oval contour lines around the center portrait
      for (let r = 1; r <= rings; r++) {
        const baseRadiusX = (width * 0.16) * r * 0.55;
        const baseRadiusY = (height * 0.14) * r * 0.55;
        const points = 72;

        ctx.beginPath();
        const strokeAlpha = Math.max(0.03, 0.12 - r * 0.007);
        ctx.strokeStyle = `rgba(239, 68, 68, ${strokeAlpha * 0.9})`;

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          
          // Organic sine wave distortion for topographic feel
          const noise = 
            Math.sin(angle * 3 + time + r * 0.4) * (14 + r * 3) +
            Math.cos(angle * 2 - time * 0.7) * (10 + r * 2);

          // Mouse proximity pull
          const currentX = centerX + Math.cos(angle) * (baseRadiusX + noise);
          const currentY = centerY + Math.sin(angle) * (baseRadiusY + noise);

          const dx = mouse.x - currentX;
          const dy = mouse.y - currentY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseDistLimit = 350;

          let finalX = currentX;
          let finalY = currentY;

          if (dist < mouseDistLimit) {
            const pull = (1 - dist / mouseDistLimit) * 18;
            finalX += (dx / dist) * pull;
            finalY += (dy / dist) * pull;
          }

          if (i === 0) {
            ctx.moveTo(finalX, finalY);
          } else {
            ctx.lineTo(finalX, finalY);
          }
        }

        ctx.closePath();
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
