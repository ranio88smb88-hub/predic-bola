import React, { useState, useMemo } from "react";
import {
  Code,
  Eye,
  Copy,
  Check,
  Download,
  Search,
  Filter,
  Lock,
} from "lucide-react";
import { MatchGroup, ColorTheme, WallpaperOption, AppSettings } from "../types";
import { SpecialMatchCarousel } from "./SpecialMatchCarousel";
import { GlowDetailButton } from "./GlowDetailButton";
import { GlowLeagueBadge } from "./GlowLeagueBadge";
import { generateVectorLogoSvg } from "../data/teamLogos";
import { DEFAULT_SITE_LOGO_URL, DEFAULT_SITE_NAME, DEFAULT_KEYWORDS_TEXT } from "../data/branding";

interface PreviewPanelProps {
  groups: MatchGroup[];
  theme: ColorTheme;
  wallpaper: WallpaperOption;
  settings: AppSettings;
  generatedHtmlCode: string;
  onToggleMatchExpanded: (matchId: string) => void;
  onExpandAllMatches: (expand: boolean) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  groups,
  theme,
  wallpaper,
  settings,
  generatedHtmlCode,
  onToggleMatchExpanded,
  onExpandAllMatches,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract all matches and find special match candidates
  const allMatches = useMemo(() => {
    return groups.flatMap((g) => g.matches);
  }, [groups]);

  const specialMatches = useMemo(() => {
    const explicit = allMatches.filter((m) => m.isSpecial);
    if (explicit.length > 0) return explicit;
    const asean = allMatches.filter(
      (m) =>
        m.league.toLowerCase().includes("asean") ||
        m.homeTeam.toLowerCase().includes("philippines") ||
        m.homeTeam.toLowerCase().includes("malaysia") ||
        m.homeTeam.toLowerCase().includes("fenerbahce")
    );
    if (asean.length > 0) {
      return [...asean, ...allMatches.filter((m) => !asean.includes(m))].slice(0, 3);
    }
    return allMatches.slice(0, 3);
  }, [allMatches]);

  // Unique league list for filter
  const uniqueLeagues = useMemo(() => {
    return Array.from(new Set(groups.map((g) => g.league)));
  }, [groups]);

  // Filtered groups based on selected league & search query
  const filteredGroups = useMemo(() => {
    return groups
      .map((g) => {
        if (selectedLeague !== "ALL" && g.league !== selectedLeague) {
          return null;
        }

        if (!searchQuery.trim()) {
          return g;
        }

        const q = searchQuery.toLowerCase().trim();
        const matchedMatches = g.matches.filter(
          (m) =>
            m.homeTeam.toLowerCase().includes(q) ||
            m.awayTeam.toLowerCase().includes(q) ||
            m.league.toLowerCase().includes(q) ||
            m.score.includes(q)
        );

        if (matchedMatches.length === 0) return null;

        return {
          ...g,
          matches: matchedMatches,
        };
      })
      .filter((g): g is MatchGroup => g !== null);
  }, [groups, selectedLeague, searchQuery]);

  // Handle Copy to Clipboard
  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtmlCode);
      setCopyFeedback("KODE HTML EMBED BERHASIL DISALIN!");
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback("GAGAL COPY OTOMATIS");
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // Handle Download HTML
  const handleDownloadHtml = () => {
    const blob = new Blob([generatedHtmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `royal-match-engine-${theme.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const siteLogoSource = settings.siteLogoUrl || DEFAULT_SITE_LOGO_URL;
  const siteName = settings.siteName || DEFAULT_SITE_NAME;
  const keywordsText = settings.keywordsText || DEFAULT_KEYWORDS_TEXT;
  const headerDateText = settings.headerDate || "TUESDAY, 28 JULY 2026";

  return (
    <div className="flex flex-col h-full">
      {/* Top Controls Bar: Tabs & Copy/Download Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-3 border-b border-amber-500/20">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-xl border border-amber-500/30">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-amber-400 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>LIVE PREVIEW</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-amber-400 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>KODE HTML EMBED</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyScript}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black font-mono text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>SALIN KODE EMBED</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs transition-all cursor-pointer"
            title="Download file .html"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DOWNLOAD</span>
          </button>
        </div>
      </div>

      {/* Copy Toast Feedback */}
      {copyFeedback && (
        <div className="mb-3 px-4 py-2 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Main Display Container */}
      <div className="flex-1 bg-[#070a10] border border-amber-500/30 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col">
        {activeTab === "preview" ? (
          /* ================= LIVE PREVIEW TAB ================= */
          <div
            className="flex-1 p-3 sm:p-6 overflow-y-auto custom-scrollbar"
            style={{
              background: wallpaper.cssBackground,
            }}
          >
            {/* Widget Container Matching Embed Width */}
            <div
              className="max-w-[672px] mx-auto rounded-[20px] p-4 sm:p-6 border backdrop-blur-xl transition-all duration-300"
              style={{
                background: "rgba(6, 8, 13, 0.45)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                boxShadow: "0 0 50px rgba(0, 0, 0, 0.8)",
              }}
            >
              {/* 1. Header Banner */}
              <div
                className="relative rounded-2xl p-5 sm:p-7 mb-5 text-center flex flex-col items-center justify-center gap-3 overflow-hidden border backdrop-blur-md"
                style={{
                  background: "rgba(10, 13, 20, 0.45)",
                  borderColor: theme.primary,
                  boxShadow: `0 0 30px ${theme.glow}`,
                }}
              >
                {/* Spotlight Beam */}
                <div
                  className="absolute top-0 left-1/4 w-48 h-full blur-2xl pointer-events-none opacity-80 rotate-12"
                  style={{
                    background: `linear-gradient(180deg, ${theme.glow}, transparent)`,
                  }}
                />

                <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                  <div className="relative py-1 flex items-center justify-center">
                    <img
                      src={siteLogoSource}
                      alt={siteName}
                      className="max-h-16 sm:max-h-20 max-w-[280px] sm:max-w-[360px] w-auto h-auto object-contain"
                      style={{
                        filter: `drop-shadow(0 0 15px ${theme.primary})`,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <p
                    className="text-xs sm:text-sm font-bold uppercase tracking-[2.5px] font-['Montserrat']"
                    style={{
                      color: theme.accent,
                      textShadow: `0 0 8px ${theme.glow}`,
                    }}
                  >
                    {headerDateText}
                  </p>
                </div>
              </div>

              {/* 2. Marquee Running Text */}
              <div
                className="rounded-xl px-3 py-2 mb-5 flex items-center overflow-hidden border backdrop-blur-md"
                style={{
                  background: "rgba(8, 12, 20, 0.45)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  boxShadow: `0 0 15px ${theme.glow}`,
                }}
              >
                <div className="inline-flex items-center whitespace-nowrap animate-marquee">
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wider inline-flex items-center gap-4 font-['Montserrat']">
                    <span>{keywordsText}</span>
                    <span style={{ color: theme.primary }}>✦</span>
                    <span>{keywordsText}</span>
                    <span style={{ color: theme.primary }}>✦</span>
                    <span>{keywordsText}</span>
                    <span style={{ color: theme.primary }}>✦</span>
                    <span>{keywordsText}</span>
                  </span>
                </div>
              </div>

              {/* 3. Special Match Carousel Slider */}
              {settings.showSpecialMatch && specialMatches.length > 0 && (
                <SpecialMatchCarousel
                  specialMatches={specialMatches}
                  theme={theme}
                  wallpaper={wallpaper}
                  customTitle={settings.specialMatchTitle || "PERTANDINGAN SPESIAL"}
                  customBadge={settings.specialMatchBadge || "BIG MATCH"}
                  autoSlide={settings.autoSlideSpecial}
                  slideIntervalSeconds={settings.slideIntervalSeconds || 6}
                />
              )}

              {/* 4. Filter Liga & Cari Tim Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {/* League Filter */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 font-['Rajdhani']"
                    style={{ color: theme.primary }}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>PILIH LIGA</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLeague}
                      onChange={(e) => setSelectedLeague(e.target.value)}
                      className="w-full h-11 bg-black/40 backdrop-blur-md rounded-xl px-4 py-0 text-xs font-bold font-['Montserrat'] outline-none cursor-pointer appearance-none pr-9 border-2"
                      style={{
                        borderColor: theme.primary,
                        color: theme.primary,
                        boxShadow: `0 0 10px ${theme.glow}`,
                      }}
                    >
                      <option value="ALL" className="bg-[#0c1017] text-white">
                        Semua Liga ({allMatches.length} Match)
                      </option>
                      {uniqueLeagues.map((league) => (
                        <option
                          key={league}
                          value={league}
                          className="bg-[#0c1017] text-white"
                        >
                          {league} (
                          {groups.find((g) => g.league === league)?.matches.length || 0}{" "}
                          Match)
                        </option>
                      ))}
                    </select>
                    <span
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                      style={{ color: theme.primary }}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {/* Team Search */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 font-['Rajdhani']"
                    style={{ color: theme.primary }}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>CARI TIM</span>
                  </label>
                  <div className="relative flex items-center">
                    <Search
                      className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80"
                      style={{ color: theme.primary }}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nama tim atau liga..."
                      className="w-full h-11 bg-black/40 backdrop-blur-md rounded-xl pl-11 pr-4 py-0 text-xs font-semibold text-white placeholder:text-slate-400 outline-none border-2 font-['Montserrat']"
                      style={{
                        borderColor: theme.primary,
                        boxShadow: `0 0 10px ${theme.glow}`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Expand / Collapse All Quick Controls */}
              <div className="flex items-center justify-end gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => onExpandAllMatches(true)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer"
                  style={{
                    background: "rgba(251, 191, 36, 0.15)",
                    border: `1px solid ${theme.borderRgba}`,
                    color: theme.primary,
                  }}
                >
                  Buka Semua Pasaran
                </button>
                <button
                  type="button"
                  onClick={() => onExpandAllMatches(false)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer"
                >
                  Tutup Semua Pasaran
                </button>
              </div>

              {/* 5. Main Fixtures List */}
              <div className="space-y-4">
                {filteredGroups.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-mono text-xs">
                    <p>Tidak ada pertandingan yang cocok dengan filter atau pencarian.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeague("ALL");
                        setSearchQuery("");
                      }}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <div key={group.league} className="space-y-3.5 pt-3">
                      {/* League Header with Glowing Shiny Badge */}
                      <div className="flex items-center justify-center gap-3 py-1.5">
                        <div
                          className="h-[1.5px] flex-1"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${theme.primary})`,
                          }}
                        />
                        <GlowLeagueBadge
                          league={group.league}
                          icon="🏆"
                          themePrimary={theme.primary}
                          themeAccent={theme.accent}
                          themeGlow={theme.glow}
                        />
                        <div
                          className="h-[1.5px] flex-1"
                          style={{
                            background: `linear-gradient(90deg, ${theme.primary}, transparent)`,
                          }}
                        />
                      </div>

                      {/* Match Cards */}
                      <div className="space-y-4">
                        {group.matches.map((m) => {
                          const scoreParts = (m.score || "1 : 0")
                            .split(":")
                            .map((s) => s.trim());
                          const scoreHome = scoreParts[0] || "0";
                          const scoreAway = scoreParts[1] || "0";

                          return (
                            <div
                              key={m.id}
                              onClick={() => onToggleMatchExpanded(m.id)}
                              className="group relative rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-300 backdrop-blur-md shadow-xl"
                              style={{
                                background: m.isExpanded
                                  ? (theme.cardBgActive || theme.cardBg)
                                  : theme.cardBg,
                                borderColor: m.isExpanded
                                  ? theme.primary
                                  : theme.borderRgba || "rgba(255, 255, 255, 0.12)",
                                boxShadow: m.isExpanded
                                  ? `0 0 28px ${theme.glow}`
                                  : `0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)`,
                              }}
                            >
                              {/* Teams Row */}
                              <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                                {/* Home Team */}
                                <div className="w-full flex flex-col items-center text-center gap-2 cursor-pointer transition-all duration-300 hover:scale-110">
                                  <div
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border-2 p-2 flex items-center justify-center transition-all duration-300 hover:scale-115"
                                    style={{
                                      borderColor: theme.primary,
                                      boxShadow: "0 0 10px rgba(0, 0, 0, 0.6)",
                                    }}
                                  >
                                    <img
                                      src={m.homeLogo}
                                      alt={m.homeTeam}
                                      className="w-full h-full object-contain rounded-full transition-all duration-300"
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          generateVectorLogoSvg(m.homeTeam);
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide max-w-[130px] sm:max-w-[160px] leading-tight font-['Montserrat'] drop-shadow-md">
                                    {m.homeTeam}
                                  </span>
                                </div>

                                {/* Score & Time Center */}
                                <div className="flex flex-col items-center justify-center gap-1 px-1">
                                  <span
                                    className="text-[10px] sm:text-[11px] font-extrabold px-3 py-0.5 rounded-full border bg-black/50 backdrop-blur-md uppercase tracking-wider font-['Montserrat']"
                                    style={{
                                      color: theme.primary,
                                      borderColor: theme.primary,
                                      boxShadow: `0 0 6px ${theme.glow}`,
                                    }}
                                  >
                                    VS
                                  </span>

                                  <div
                                    className="text-2xl sm:text-3xl font-black font-['Orbitron'] tracking-widest flex items-center gap-2 my-0.5"
                                    style={{
                                      color: theme.primary,
                                      textShadow: `0 0 12px ${theme.glow}`,
                                    }}
                                  >
                                    <span>{scoreHome}</span>
                                    <span className="text-white">:</span>
                                    <span>{scoreAway}</span>
                                  </div>

                                  <span className="text-[11px] font-semibold text-slate-300 whitespace-nowrap tracking-wide font-['Montserrat']">
                                    {m.date ? `${m.date} • ` : ""}
                                    {m.time} WIB
                                  </span>
                                </div>

                                {/* Away Team */}
                                <div className="w-full flex flex-col items-center text-center gap-2 cursor-pointer transition-all duration-300 hover:scale-110">
                                  <div
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border-2 p-2 flex items-center justify-center transition-all duration-300 hover:scale-115"
                                    style={{
                                      borderColor: theme.primary,
                                      boxShadow: "0 0 10px rgba(0, 0, 0, 0.6)",
                                    }}
                                  >
                                    <img
                                      src={m.awayLogo}
                                      alt={m.awayTeam}
                                      className="w-full h-full object-contain rounded-full transition-all duration-300"
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          generateVectorLogoSvg(m.awayTeam);
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide max-w-[130px] sm:max-w-[160px] leading-tight font-['Montserrat'] drop-shadow-md">
                                    {m.awayTeam}
                                  </span>
                                </div>
                              </div>

                              {/* Win Probability Bar Indicator */}
                              {settings.showProbabilityBar && (
                                <div className="w-full max-w-[280px] sm:max-w-[320px] h-1.5 mx-auto bg-slate-800/60 rounded-full flex overflow-hidden border border-white/10 my-2">
                                  <div
                                    className="h-full rounded-l-full"
                                    style={{
                                      width: `${m.homeProb}%`,
                                      background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                                    }}
                                  />
                                  <div
                                    className="h-full rounded-r-full bg-slate-600/70"
                                    style={{
                                      width: `${m.awayProb}%`,
                                    }}
                                  />
                                </div>
                              )}

                              {/* 4-Grid Probability & Prediction Analytics (Revealed on Click) */}
                              {m.isExpanded ? (
                                <div className="space-y-2 mt-3 pt-3 border-t border-white/10 animate-fade-in">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center flex flex-col gap-1 shadow-md">
                                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
                                        HANDICAP
                                      </span>
                                      <span className="text-sm sm:text-base font-black text-cyan-400 font-['Orbitron'] drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]">
                                        {m.hdp || "0 : 1/2"}
                                      </span>
                                      <span
                                        className="text-[10px] sm:text-[11px] font-bold font-['Montserrat'] truncate"
                                        style={{ color: theme.primary }}
                                      >
                                        {m.specialHdpNote || "Favorit Tuan Rumah"}
                                      </span>
                                    </div>

                                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center flex flex-col gap-1 shadow-md">
                                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
                                        OVER/UNDER
                                      </span>
                                      <span className="text-sm sm:text-base font-black text-cyan-400 font-['Orbitron'] drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]">
                                        {m.ou || "Under 2.5"}
                                      </span>
                                      <span
                                        className="text-[10px] sm:text-[11px] font-bold font-['Montserrat'] truncate"
                                        style={{ color: theme.primary }}
                                      >
                                        {m.specialScoreNote || "Adu Taktik"}
                                      </span>
                                    </div>

                                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center flex flex-col gap-1 shadow-md">
                                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
                                        1X2 ODDS
                                      </span>
                                      <span className="text-sm sm:text-base font-black text-cyan-400 font-['Orbitron'] drop-shadow-[0_0_6px_rgba(34,211,238,0.7)] truncate">
                                        {m.odds1x2 || "Tuan Rumah Menang"}
                                      </span>
                                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 font-['Montserrat']">
                                        Match Pick
                                      </span>
                                    </div>

                                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center flex flex-col gap-1 shadow-md">
                                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
                                        ACCURACY
                                      </span>
                                      <span className="text-sm sm:text-base font-black text-cyan-400 font-['Orbitron'] drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]">
                                        {m.score || "1 : 0"}
                                      </span>
                                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 font-['Montserrat']">
                                        Precision
                                      </span>
                                    </div>
                                  </div>

                                  <div className="pt-2 flex items-center justify-center">
                                    <GlowDetailButton
                                      label="DETAIL"
                                      isExpanded={true}
                                      themePrimary={theme.primary}
                                      themeAccent={theme.accent}
                                      themeGlow={theme.glow}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleMatchExpanded(m.id);
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                /* Clean Glow DETAIL Action Button */
                                <div className="pt-2 flex items-center justify-center">
                                  <GlowDetailButton
                                    label="DETAIL"
                                    isExpanded={false}
                                    themePrimary={theme.primary}
                                    themeAccent={theme.accent}
                                    themeGlow={theme.glow}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleMatchExpanded(m.id);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================= KODE HTML EMBED TAB ================= */
          <div className="flex-1 p-4 bg-[#05080e] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Siap di-copy & paste ke Blogger, WordPress, atau Website HTML</span>
              </div>
              <button
                type="button"
                onClick={handleCopyScript}
                className="px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Copy Code
              </button>
            </div>
            <pre className="flex-1 p-4 bg-black/80 rounded-xl border border-slate-800 overflow-auto font-mono text-xs text-amber-300/90 custom-scrollbar leading-relaxed">
              <code>{generatedHtmlCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
