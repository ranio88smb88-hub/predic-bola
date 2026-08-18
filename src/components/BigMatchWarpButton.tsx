import React, { useRef, useEffect, useState } from "react";

interface BigMatchWarpButtonProps {
  label?: string;
  className?: string;
  themePrimary?: string;
  themeAccent?: string;
  themeGlow?: string;
  onClick?: () => void;
  defaultActive?: boolean;
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

export const BigMatchWarpButton: React.FC<BigMatchWarpButtonProps> = ({
  label = "🔥 BIG MATCH",
  className = "",
  themePrimary = "#f59e0b",
  themeAccent = "#fbbf24",
  themeGlow = "rgba(245, 158, 11, 0.6)",
  onClick,
  defaultActive = true,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(defaultActive);

  useEffect(() => {
    const canvas = canvasRef.current;
    const btn = buttonRef.current;
    if (!canvas || !btn) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = btn.offsetWidth || 180);
    let H = (canvas.height = btn.offsetHeight || 42);
    let XO = W / 2;
    let YO = H / 2;

    const NUM_PARTICLES = 55;
    const MAX_Z = 2.2;
    const MAX_R = 2.2;
    const Z_SPD = 1.8;

    class Particle {
      pos: Vector3D;
      vel: Vector3D;
      fill: string;
      stroke: string;

      constructor(x: number, y: number, z: number) {
        this.pos = new Vector3D(x, y, z);
        this.vel = new Vector3D(0, 0, -Z_SPD);
        this.vel.scale(0.01);
        this.fill = "rgba(255, 255, 255, 0.75)";
        this.stroke = "rgba(251, 191, 36, 0.85)";
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
        const R = Math.max(0.6, ((MAX_Z - this.pos.z) / MAX_Z) * MAX_R);

        if (PX < -15 || PX > W + 15 || PY < -15 || PY > H + 15 || this.pos.z <= 0.06) {
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
      if (isActive) {
        ctx.fillStyle = "rgba(6, 8, 14, 0.25)";
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < particles.length; i++) {
          particles[i].render();
        }
      } else {
        ctx.clearRect(0, 0, W, H);
      }
      animId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      if (!btn || !canvas) return;
      W = canvas.width = btn.offsetWidth || 180;
      H = canvas.height = btn.offsetHeight || 42;
      XO = W / 2;
      YO = H / 2;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(btn);

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [isActive]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive((prev) => !prev);
    if (onClick) onClick();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      title="Klik untuk ganti slide pertandingan / toggle efek partikel"
      className={`relative inline-flex items-center justify-center p-[2px] rounded-full overflow-hidden cursor-pointer select-none transition-all duration-300 group ${className}`}
      style={{
        boxShadow: isActive
          ? `0 0 20px ${themeGlow}, 0 6px 20px rgba(0,0,0,0.9)`
          : `0 4px 12px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Dynamic Animated Glowing Border */}
      <span
        className="absolute inset-0 rounded-full transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${themeAccent}, #ffffff, ${themePrimary})`,
          opacity: isActive ? 1 : 0.4,
        }}
      />

      {/* Particle Canvas Layer (strictly behind text) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-full"
      />

      {/* High-Contrast Foreground Text Container */}
      <span
        className="relative z-20 flex items-center justify-center gap-2 px-6 py-2 min-h-[38px] rounded-full font-['Montserrat'] font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300"
        style={{
          backgroundColor: isActive ? "rgba(9, 12, 20, 0.92)" : "rgba(15, 23, 42, 0.95)",
          color: "#ffffff",
          textShadow: `0 0 10px ${themeAccent}, 0 2px 4px rgba(0,0,0,0.9)`,
        }}
      >
        <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
          {label.startsWith("🔥") ? "🔥" : "⭐"}
        </span>
        <span
          className="font-extrabold tracking-widest"
          style={{
            color: "#ffffff",
          }}
        >
          {label.replace(/^[🔥⭐\s]+/, "")}
        </span>
      </span>
    </button>
  );
};
