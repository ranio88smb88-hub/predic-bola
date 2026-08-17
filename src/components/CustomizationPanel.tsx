import React from "react";
import {
  SlidersHorizontal,
  Calendar,
  Image as ImageIcon,
  Palette,
  Check,
  FileCode,
  HelpCircle,
  Trash2,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  Bot,
} from "lucide-react";
import { ColorTheme, WallpaperOption } from "../types";
import { COLOR_THEMES } from "../data/themes";
import { WALLPAPER_OPTIONS } from "../data/wallpapers";

interface CustomizationPanelProps {
  headerDate: string;
  onChangeHeaderDate: (val: string) => void;
  selectedWallpaperId: string;
  onChangeWallpaper: (id: string) => void;
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
  rawScriptText: string;
  onChangeRawScript: (val: string) => void;
  detectedCount: number;
  onGenerateScript: () => void;
  onOpenFormatGuide: () => void;
  onOpenAiAssistant: () => void;
  onClearText: () => void;
  onOpenSettings: () => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  headerDate,
  onChangeHeaderDate,
  selectedWallpaperId,
  onChangeWallpaper,
  selectedThemeId,
  onSelectTheme,
  rawScriptText,
  onChangeRawScript,
  detectedCount,
  onGenerateScript,
  onOpenFormatGuide,
  onOpenAiAssistant,
  onClearText,
  onOpenSettings,
}) => {
  const currentTheme = COLOR_THEMES.find((t) => t.id === selectedThemeId) || COLOR_THEMES[0];

  const setQuickDate = (type: "today" | "tomorrow") => {
    const d = new Date();
    if (type === "tomorrow") {
      d.setDate(d.getDate() + 1);
    }
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const months = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];
    const str = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    onChangeHeaderDate(str);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. KUSTOMISASI CEPAT CARD */}
      <div className="bg-[#101522]/90 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-amber-400 uppercase font-mono">
              KUSTOMISASI CEPAT
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors font-mono cursor-pointer"
          >
            <span>Semua Pengaturan</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-4">
          {/* UBAH TANGGAL HEADER */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>UBAH TANGGAL HEADER</span>
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate("today")}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate("tomorrow")}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                >
                  Besok
                </button>
              </div>
            </div>
            <input
              id="input_header_date"
              type="text"
              value={headerDate}
              onChange={(e) => onChangeHeaderDate(e.target.value)}
              placeholder="e.g. TUESDAY, 28 JULY 2026"
              className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2 text-sm font-mono text-white tracking-wide outline-none transition-all shadow-inner"
            />
          </div>

          {/* WALLPAPER PERTANDINGAN SPESIAL */}
          <div>
            <label className="text-[11px] font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-1.5 mb-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>WALLPAPER PERTANDINGAN SPESIAL</span>
            </label>
            <div className="relative">
              <select
                id="select_wallpaper"
                value={selectedWallpaperId}
                onChange={(e) => onChangeWallpaper(e.target.value)}
                className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-mono text-white tracking-wide outline-none transition-all appearance-none cursor-pointer"
              >
                {WALLPAPER_OPTIONS.map((wp) => (
                  <option key={wp.id} value={wp.id} className="bg-slate-900 text-white">
                    {wp.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SELECT ROYAL COLOR THEME CARD */}
      <div className="bg-[#101522]/90 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-amber-400 uppercase font-mono">
              SELECT ROYAL COLOR THEME
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentTheme.primary }}
            ></span>
            <span>{currentTheme.name}</span>
          </span>
        </div>

        {/* 14 Theme Swatches Grid (2 rows of 7) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-2.5 mb-3">
          {COLOR_THEMES.map((theme) => {
            const isSelected = theme.id === selectedThemeId;
            return (
              <button
                key={theme.id}
                id={`theme_swatch_${theme.id}`}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                title={theme.name}
                className={`relative aspect-square rounded-lg transition-all duration-200 cursor-pointer overflow-hidden group flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                    : "opacity-80 hover:opacity-100 hover:scale-105 border border-white/10"
                }`}
                style={{
                  background: theme.swatchGradient,
                }}
              >
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <Check className="w-3 h-3 text-amber-300 stroke-[3]" />
                  </div>
                )}
                {/* Subtle top gloss reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
              </button>
            );
          })}
        </div>

        <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
          Pilih warna tema di atas untuk mengubah nuansa warna Live Preview & Embed Code secara langsung.
        </p>
      </div>

      {/* 3. INPUT MATCH PREDICTIONS DATA CARD */}
      <div className="bg-[#101522]/90 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Header & Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-amber-400 uppercase font-mono">
              INPUT MATCH PREDICTIONS DATA
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Matches Detected Badge */}
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              {detectedCount} Matches Detected
            </span>

            {/* AI Assistant Tool */}
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="p-1 rounded bg-purple-950/50 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center gap-1 px-1.5 transition-colors cursor-pointer"
              title="AI Script Generator & Cleaner"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Helper</span>
            </button>

            {/* Format Guide Tooltip/Modal */}
            <button
              type="button"
              onClick={onOpenFormatGuide}
              className="text-slate-400 hover:text-amber-400 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
              title="Panduan Format Script"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Format Guide</span>
            </button>

            {/* Clear Button */}
            <button
              type="button"
              onClick={onClearText}
              className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              title="Bersihkan Input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative mb-4">
          <textarea
            id="textarea_raw_script"
            value={rawScriptText}
            onChange={(e) => onChangeRawScript(e.target.value)}
            rows={12}
            placeholder={`ASEAN CHAMPIONSHIP 2026\n18:00\nWIB • 28/07\nPhilippines\nVS\nMyanmar\n1 : 0\n\nCOPA LIBERTADORES\n01:30\nWIB • 29/07\nSparta Prague\nVS\nShamrock Rovers\n3 : 0`}
            className="w-full bg-[#080b12] border border-slate-800 focus:border-amber-400/80 rounded-lg p-3.5 font-mono text-xs sm:text-sm text-emerald-300/90 leading-relaxed outline-none transition-all resize-y shadow-inner custom-scrollbar"
            spellCheck={false}
          />
          <div className="absolute right-3 bottom-3 pointer-events-none text-[10px] font-mono text-slate-600">
            Plaintext Parser Active
          </div>
        </div>

        {/* Big Neon CTA Button */}
        <button
          id="btn_generate_script"
          type="button"
          onClick={onGenerateScript}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-sm sm:text-base tracking-widest uppercase font-mono flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer"
        >
          <RefreshCw className="w-5 h-5 text-slate-950 animate-spin-slow" />
          <span>GENERATE ROYAL SCRIPT</span>
        </button>
      </div>
    </div>
  );
};
