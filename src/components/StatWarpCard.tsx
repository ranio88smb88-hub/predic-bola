import React, { useRef, useEffect } from "react";
import { ColorTheme } from "../types";

interface StatWarpCardProps {
  label: string;
  value: string;
  subtext: string;
  valueColorType?: "cyan" | "gold";
  subtextColorType?: "cyan" | "gold";
  theme: ColorTheme;
  className?: string;
}

class Vector3D {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(v: Vector3D) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  scale(n: number) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
  }
}

export const StatWarpCard: React.FC<StatWarpCardProps> = ({
  label,
  value,
  subtext,
  valueColorType = "gold",
  subtextColorType = "cyan",
  theme,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = container.offsetWidth || 180);
    let H = (canvas.height = container.offsetHeight || 90);
    let XO = W / 2;
    let YO = H / 2;

    const NUM_PARTICLES = 36;
    const MAX_Z = 2.2;
    const MAX_R = 2.0;
    const Z_SPD = 1.6;

    class Particle {
      pos: Vector3D;
      vel: Vector3D;
      fill: string;
      stroke: string;

      constructor(x: number, y: number, z: number) {
        this.pos = new Vector3D(x, y, z);
        this.vel = new Vector3D(0, 0, -Z_SPD);
        this.vel.scale(0.01);
        this.fill = "rgba(255, 255, 255, 0.8)";
        this.stroke = valueColorType === "cyan" ? "rgba(34, 211, 238, 0.85)" : "rgba(251, 191, 36, 0.85)";
      }

      update() {
        this.pos.add(this.vel);
      }

      render() {
        if (!ctx) return;
        const zSafe = Math.max(this.pos.z, 0.06);
        const X_COORD = this.pos.x - XO;
        const Y_COORD = this.pos.y - YO;
        const PX = X_COORD / zSafe + XO;
        const PY = Y_COORD / zSafe + YO;
        const R = Math.max(0.5, ((MAX_Z - this.pos.z) / MAX_Z) * MAX_R);

        if (PX < -10 || PX > W + 10 || PY < -10 || PY > H + 10 || this.pos.z <= 0.06) {
          this.pos.z = MAX_Z;
          this.pos.x = Math.random() * W;
          this.pos.y = Math.random() * H;
        }

        this.update();
        ctx.beginPath();
        ctx.fillStyle = this.fill;
        ctx.strokeStyle = this.stroke;
        ctx.arc(PX, PY, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(
        new Particle(Math.random() * W, Math.random() * H, Math.random() * MAX_Z)
      );
    }

    const renderLoop = () => {
      ctx.fillStyle = "rgba(7, 10, 18, 0.32)";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        particles[i].render();
      }
      animId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      if (!container || !canvas) return;
      W = canvas.width = container.offsetWidth || 180;
      H = canvas.height = container.offsetHeight || 90;
      XO = W / 2;
      YO = H / 2;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [valueColorType]);

  return (
    <div
      ref={containerRef}
      className={`group relative p-[2px] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${className}`}
      style={{
        boxShadow: `0 0 20px ${theme.glow}, 0 6px 20px rgba(0,0,0,0.85)`,
      }}
    >
      {/* Dynamic Animated Glowing Border */}
      <span
        className="absolute inset-0 rounded-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-80"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, #ffffff, ${theme.primary})`,
        }}
      />

      {/* Particle Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-2xl"
      />

      {/* High-Contrast Foreground Content */}
      <div
        className="relative z-20 flex flex-col items-center justify-center gap-0.5 p-3 sm:p-3.5 rounded-[14px] backdrop-blur-md text-center transition-all duration-300 w-full h-full"
        style={{
          backgroundColor: "rgba(9, 12, 20, 0.92)",
        }}
      >
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-wider uppercase font-['Rajdhani'] drop-shadow">
          {label}
        </span>

        {valueColorType === "cyan" ? (
          <span className="text-base sm:text-xl font-extrabold text-cyan-400 font-['Orbitron'] drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] my-0.5">
            {value}
          </span>
        ) : (
          <span
            className="text-base sm:text-xl font-extrabold font-['Orbitron'] my-0.5"
            style={{
              color: theme.primary,
              textShadow: `0 0 12px ${theme.glow}`,
            }}
          >
            {value}
          </span>
        )}

        {subtextColorType === "gold" ? (
          <span
            className="text-[10px] sm:text-[11px] font-bold font-['Montserrat'] truncate max-w-full drop-shadow"
            style={{ color: theme.primary }}
          >
            {subtext}
          </span>
        ) : (
          <span className="text-[10px] sm:text-[11px] font-bold text-cyan-300 font-['Montserrat'] truncate max-w-full drop-shadow">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
