import React from "react";
import { Sparkles, RefreshCw, FolderDown, ExternalLink, Settings, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onOpenTemplateModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenSourceModal: (sourceNum: number) => void;
  isSyncingLogos?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTemplateModal,
  onOpenSettingsModal,
  onOpenSourceModal,
  isSyncingLogos = false,
}) => {
  return (
    <header className="w-full border-b border-amber-500/20 bg-[#0b0e14]/95 backdrop-blur-md px-4 py-3 sm:px-6 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wider text-white uppercase font-mono flex items-center gap-2">
              <span className="text-amber-400">FOOTBALL</span>
              <span>SCRIPT</span>
              <span className="text-emerald-400">GENERATOR</span>
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-black tracking-widest uppercase bg-amber-400 text-slate-950 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              ROYAL EDITION
            </span>
          </div>
          <p className="text-[11px] sm:text-xs font-mono font-medium tracking-wide text-slate-400 flex items-center gap-2">
            <span className="text-amber-400/90 font-bold">ELITE LUXURY LAYOUT ENGINE</span>
            <span className="text-slate-600">//</span>
            <span className="text-slate-400">INTERACTIVE CARD & PROBABILITY GRID</span>
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Logo Sync Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncingLogos ? "animate-spin" : ""}`} />
            <span className="text-slate-400 hidden sm:inline">Syncing Logos...</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Load Template Button */}
          <button
            id="btn_load_template"
            type="button"
            onClick={onOpenTemplateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold font-mono tracking-wide transition-all shadow-[0_0_10px_rgba(251,191,36,0.15)] cursor-pointer"
          >
            <FolderDown className="w-3.5 h-3.5 text-amber-400" />
            <span>LOAD TEMPLATE</span>
          </button>

          {/* Source 1 */}
          <button
            id="btn_source_1"
            type="button"
            onClick={() => onOpenSourceModal(1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 hover:border-blue-400 text-blue-300 text-xs font-bold font-mono tracking-wide transition-all cursor-pointer"
            title="Live Score & Fixture Source 1 (Flashscore/SofaScore)"
          >
            <span>SOURCE 1</span>
            <ExternalLink className="w-3 h-3 text-blue-400" />
          </button>

          {/* Source 2 */}
          <button
            id="btn_source_2"
            type="button"
            onClick={() => onOpenSourceModal(2)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-xs font-bold font-mono tracking-wide transition-all cursor-pointer"
            title="Market & Odds Source 2 (AsianBookie/Oddspedia)"
          >
            <span>SOURCE 2</span>
            <ExternalLink className="w-3 h-3 text-emerald-400" />
          </button>

          {/* Settings Cog */}
          <button
            id="btn_header_settings"
            type="button"
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 transition-all cursor-pointer"
            title="Konfigurasi Pengaturan Lanjutan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
