import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MatchItem, ColorTheme, WallpaperOption } from "../types";
import { generateVectorLogoSvg } from "../data/teamLogos";

interface SpecialMatchCarouselProps {
  specialMatches: MatchItem[];
  theme: ColorTheme;
  wallpaper?: WallpaperOption;
  customTitle?: string;
  customBadge?: string;
  autoSlide?: boolean;
  slideIntervalSeconds?: number;
}

export const SpecialMatchCarousel: React.FC<SpecialMatchCarouselProps> = ({
  specialMatches,
  theme,
  wallpaper,
  customTitle = "PERTANDINGAN SPESIAL",
  customBadge = "BIG MATCH",
  autoSlide = false,
  slideIntervalSeconds = 6,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= specialMatches.length) {
      setCurrentIndex(Math.max(0, specialMatches.length - 1));
    }
  }, [specialMatches.length, currentIndex]);

  // Optional auto-slide
  useEffect(() => {
    if (!autoSlide || specialMatches.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % specialMatches.length);
    }, (slideIntervalSeconds || 6) * 1000);
    return () => clearInterval(timer);
  }, [autoSlide, slideIntervalSeconds, specialMatches.length]);

  if (!specialMatches || specialMatches.length === 0) {
    return null;
  }

  const match = specialMatches[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? specialMatches.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % specialMatches.length);
  };

  // Compute HDP formatted display
  const hdpDisplay = match.hdp || "0 : 1/2";
  const hdpNote =
    match.specialHdpNote ||
    (currentIndex === 1 ? "Tamu Diunggulkan" : "Favorit Tuan Rumah");

  // Score display
  const scoreDisplay = match.score || "1 : 0";
  const scoreNote =
    match.specialScoreNote ||
    (currentIndex === 1 ? "Under 2.5 (Pertahanan Rapat)" : "Under 2.0 (Adu Taktik)");

  const badgeLabel =
    currentIndex === 0
      ? `🔥 ${customBadge || "BIG MATCH"}`
      : currentIndex === 1
      ? "🔥 MATCH DAY"
      : "🔥 SUPER MATCH";

  const cardBackgroundStyle = wallpaper?.imageUrl
    ? `linear-gradient(to bottom, rgba(8, 10, 16, 0.72) 0%, rgba(4, 6, 11, 0.88) 100%), url('${wallpaper.imageUrl}')`
    : wallpaper?.cssBackground ||
      "linear-gradient(to bottom, rgba(8, 10, 16, 0.72) 0%, rgba(4, 6, 11, 0.88) 100%), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop')";

  return (
    <div className="flex flex-col w-full mb-6 pt-2">
      {/* Top Floating Centered Title Pill */}
      <div className="flex justify-center -mb-3.5 relative z-20">
        <div
          className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border shadow-2xl backdrop-blur-xl"
          style={{
            background: "rgba(10, 14, 23, 0.95)",
            borderColor: theme.primary,
            color: theme.primary,
            boxShadow: `0 4px 14px rgba(0,0,0,0.7), 0 0 14px ${theme.glow}`,
          }}
        >
          <span className="text-xs">⭐</span>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase font-['Montserrat']">
            {customTitle}
          </span>
          <span className="text-xs">⭐</span>
        </div>
      </div>

      {/* Main Special Stadium Card */}
      <div
        className="relative rounded-2xl border-2 overflow-hidden backdrop-blur-md pt-4 transition-all duration-500"
        style={{
          borderColor: theme.primary,
          boxShadow: `0 0 30px ${theme.glow}`,
          backgroundImage: cardBackgroundStyle,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Stadium Spotlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 blur-3xl pointer-events-none opacity-50"
          style={{
            background: `radial-gradient(circle, ${theme.primary}, transparent)`,
          }}
        />

        {/* Slide Content */}
        <div className="relative z-10 px-4 sm:px-6 pt-3 pb-4 text-center">
          {/* Badge */}
          <div className="flex justify-center mb-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase shadow-md"
              style={{
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                color: "#000000",
                boxShadow: `0 0 12px ${theme.glow}`,
              }}
            >
              {badgeLabel}
            </span>
          </div>

          {/* League Title */}
          <div
            className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-center mb-3 font-['Montserrat']"
            style={{
              color: theme.accent,
              textShadow: `0 0 10px ${theme.glow}`,
            }}
          >
            {match.league}
          </div>

          {/* Teams Row */}
          <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-2 sm:gap-4 my-2">
            {/* Home Team */}
            <div className="group w-full flex flex-col items-center text-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 backdrop-blur-md border-2 p-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  borderColor: theme.primary,
                  boxShadow: `0 0 20px ${theme.glow}`,
                }}
              >
                <img
                  src={match.homeLogo}
                  alt={match.homeTeam}
                  className="w-full h-full object-contain rounded-full transition-all duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = generateVectorLogoSvg(match.homeTeam);
                  }}
                />
              </div>
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wide max-w-[130px] sm:max-w-[160px] leading-tight font-['Montserrat'] drop-shadow-md">
                {match.homeTeam}
              </span>
            </div>

            {/* VS & Time in Center */}
            <div className="flex flex-col items-center justify-center gap-1.5 px-1">
              <span
                className="text-sm sm:text-base font-black tracking-widest font-['Montserrat']"
                style={{
                  color: theme.primary,
                  textShadow: `0 0 12px ${theme.glow}`,
                }}
              >
                VS
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 bg-black/60 backdrop-blur-md px-2.5 sm:px-3 py-0.5 rounded-full border border-white/15 whitespace-nowrap tracking-wide font-['Montserrat']">
                {match.date ? `${match.date} • ` : ""}
                {match.time} WIB
              </span>
            </div>

            {/* Away Team */}
            <div className="group w-full flex flex-col items-center text-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 backdrop-blur-md border-2 p-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  borderColor: theme.primary,
                  boxShadow: `0 0 20px ${theme.glow}`,
                }}
              >
                <img
                  src={match.awayLogo}
                  alt={match.awayTeam}
                  className="w-full h-full object-contain rounded-full transition-all duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = generateVectorLogoSvg(match.awayTeam);
                  }}
                />
              </div>
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wide max-w-[130px] sm:max-w-[160px] leading-tight font-['Montserrat'] drop-shadow-md">
                {match.awayTeam}
              </span>
            </div>
          </div>

          {/* Pasaran & Prediksi Boxes */}
          <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 mt-3 pt-3 border-t border-white/10">
            <div
              className="bg-black/50 backdrop-blur-md border rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-0.5 shadow-lg"
              style={{ borderColor: theme.primary }}
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-wider uppercase font-['Rajdhani']">
                PASARAN HDP
              </span>
              <span className="text-base sm:text-xl font-extrabold text-cyan-400 font-['Orbitron'] drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                {hdpDisplay}
              </span>
              <span
                className="text-[10px] sm:text-[11px] font-bold font-['Montserrat'] truncate"
                style={{ color: theme.primary }}
              >
                {hdpNote}
              </span>
            </div>

            <div
              className="bg-black/50 backdrop-blur-md border rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-0.5 shadow-lg"
              style={{ borderColor: theme.primary }}
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-wider uppercase font-['Rajdhani']">
                PREDIKSI SKOR
              </span>
              <span
                className="text-base sm:text-xl font-extrabold font-['Orbitron']"
                style={{
                  color: theme.primary,
                  textShadow: `0 0 10px ${theme.glow}`,
                }}
              >
                {scoreDisplay}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-cyan-300 font-['Montserrat'] truncate">
                {scoreNote}
              </span>
            </div>
          </div>
        </div>

        {/* Soft Arrow Navigation Controls */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-2 bg-black/60 backdrop-blur-md border-t border-white/10">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-amber-300 transition-all cursor-pointer shadow-md hover:scale-110"
            title="Pertandingan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 tracking-widest font-['Montserrat']">
              {currentIndex + 1} / {specialMatches.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-amber-300 transition-all cursor-pointer shadow-md hover:scale-110"
            title="Pertandingan Selanjutnya"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

