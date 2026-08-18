import React, { useRef, useState } from "react";

interface GlowLeagueBadgeProps {
  league: string;
  icon?: string;
  themePrimary?: string;
  themeAccent?: string;
  themeGlow?: string;
  className?: string;
}

export const GlowLeagueBadge: React.FC<GlowLeagueBadgeProps> = ({
  league,
  icon = "🏆",
  themePrimary = "#f59e0b",
  themeAccent = "#fbbf24",
  themeGlow = "rgba(245, 158, 11, 0.4)",
  className = "",
}) => {
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 100, y: 18 });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    setPointerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={badgeRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden select-none transition-all duration-300 hover:scale-105 ${className}`}
      style={{
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.6), 0 0 16px ${themeGlow}`,
      }}
    >
      {/* Rotating Conic Shine Gradient Border */}
      <div className="absolute -inset-[150%] animate-[spin_4s_linear_infinite] pointer-events-none rounded-full"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${themePrimary} 60deg, #ffffff 120deg, ${themeAccent} 180deg, transparent 240deg)`,
        }}
      />

      {/* High-Contrast Foreground Badge Body */}
      <div
        className="relative z-10 flex items-center justify-center gap-2.5 px-6 py-2 rounded-full font-['Montserrat'] overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: "rgba(8, 11, 18, 0.94)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Interactive Pointer Glow Orb */}
        <span
          className="absolute w-16 h-16 rounded-full pointer-events-none blur-md transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${pointerPos.x}px`,
            top: `${pointerPos.y}px`,
            background: themeAccent,
            opacity: isHovered ? 0.6 : 0.15,
          }}
        />

        {/* League Icon & Name */}
        <span className="relative z-10 text-base sm:text-lg select-none drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
          {icon}
        </span>
        <h3
          className="relative z-10 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 font-['Montserrat'] whitespace-nowrap"
          style={{
            color: themePrimary,
            textShadow: `0 0 10px ${themeGlow}, 0 2px 4px rgba(0,0,0,0.9)`,
          }}
        >
          {league}
        </h3>
      </div>
    </div>
  );
};
