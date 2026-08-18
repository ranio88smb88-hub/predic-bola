import React, { useRef, useState } from "react";

interface GlowDetailButtonProps {
  label?: string;
  isExpanded?: boolean;
  themePrimary?: string;
  themeAccent?: string;
  themeGlow?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const GlowDetailButton: React.FC<GlowDetailButtonProps> = ({
  label = "DETAIL",
  isExpanded = false,
  themePrimary = "#f59e0b",
  themeAccent = "#fbbf24",
  themeGlow = "rgba(245, 158, 11, 0.4)",
  className = "",
  onClick,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 50, y: 15 });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPointerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden border-none outline-none bg-transparent cursor-pointer select-none transition-transform duration-200 active:scale-95 ${className}`}
      style={{
        boxShadow: isExpanded
          ? `0 4px 16px rgba(0, 0, 0, 0.7), 0 0 14px rgba(0, 242, 254, 0.45)`
          : `0 4px 14px rgba(0, 0, 0, 0.6), 0 0 12px ${themeGlow}`,
      }}
    >
      {/* Rotating Conic Shine Gradient Border */}
      <div
        className="absolute -inset-[150%] animate-[spin_3s_linear_infinite] pointer-events-none rounded-full"
        style={{
          background: isExpanded
            ? `conic-gradient(from 0deg, transparent 0deg, #00f2fe 60deg, #ffffff 120deg, #38bdf8 180deg, transparent 240deg)`
            : `conic-gradient(from 0deg, transparent 0deg, ${themePrimary} 60deg, #ffffff 120deg, ${themeAccent} 180deg, transparent 240deg)`,
        }}
      />

      {/* Button Body with Radial Glow on Pointer */}
      <span
        className="relative z-10 flex items-center justify-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full font-['Montserrat'] font-extrabold text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 overflow-hidden"
        style={{
          backgroundColor: isExpanded ? "rgba(10, 14, 24, 0.95)" : "rgba(8, 11, 18, 0.94)",
          color: isExpanded ? "#38bdf8" : "#ffffff",
          textShadow: isExpanded
            ? "0 0 8px rgba(56, 189, 248, 0.8)"
            : "0 0 8px rgba(251, 191, 36, 0.6)",
        }}
      >
        {/* Interactive Dynamic Glow Orb */}
        <span
          className="absolute w-12 h-12 rounded-full pointer-events-none blur-md transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${pointerPos.x}px`,
            top: `${pointerPos.y}px`,
            background: isExpanded ? "#38bdf8" : themeAccent,
            opacity: isHovered ? 0.65 : 0.15,
          }}
        />

        {/* Text and Arrow */}
        <span className="relative z-10 font-black tracking-widest flex items-center gap-1.5">
          <span>{isExpanded ? "TUTUP DETAIL" : label}</span>
          <span
            className={`text-[9px] font-black transition-transform duration-300 ${
              isExpanded ? "rotate-180 text-cyan-400" : "text-amber-400"
            }`}
          >
            ▼
          </span>
        </span>
      </span>
    </button>
  );
};
