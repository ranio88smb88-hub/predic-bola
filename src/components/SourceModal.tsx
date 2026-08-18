import React from "react";
import { X, ExternalLink, Globe, Zap, ArrowRight, Shield } from "lucide-react";

interface SourceModalProps {
  sourceNum: number | null;
  onClose: () => void;
  onQuickInjectSourceData: (sampleData: string) => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({
  sourceNum,
  onClose,
  onQuickInjectSourceData,
}) => {
  if (!sourceNum) return null;

  const isSource1 = sourceNum === 1;

  const sourceTitle = isSource1
    ? "SOURCE 1: LIVE FIXTURES & SCORES FEED"
    : "SOURCE 2: MARKET ODDS & ASIAN HANDICAP FEED";

  const sourceDesc = isSource1
    ? "Sumber data jadwal resmi, skor langsung, dan form pertandingan terkini (Flashscore / SofaScore / ESPN)."
    : "Sumber pasaran handicap Asia, Over/Under odds, dan pergerakan bursa taruhan (AsianBookie / Oddspedia / Nowgoal).";

  const sourceLinks = isSource1
    ? [
        { name: "JP Bola Pelangi (Source 1)", url: "https://jpbolepalngi2.pagesco.de/", badge: "Main Feed" },
        { name: "Flashscore Live Fixtures", url: "https://www.flashscore.com", badge: "Live Scores" },
        { name: "SofaScore Football Stats", url: "https://www.sofascore.com", badge: "Detailed Stats" },
      ]
    : [
        { name: "JP Bola Pelangi (Source 1)", url: "https://jpbolepalngi2.pagesco.de/", badge: "Main Feed" },
        { name: "AsianBookie Handicap Portal", url: "https://www.asianbookie.com", badge: "Asian HDP" },
        { name: "Oddspedia Market Movement", url: "https://oddspedia.com", badge: "Odds 1X2" },
      ];

  const quickSample1 = `UEFA CHAMPIONS LEAGUE
02:00
WIB • 30/07
Real Madrid
VS
Manchester City
2 : 1
02:00
WIB • 30/07
Arsenal
VS
Bayern Munich
2 : 0`;

  const quickSample2 = `COPA LIBERTADORES
05:00
WIB • 29/07
Flamengo
VS
Bolivar
2 : 0
07:30
WIB • 29/07
River Plate
VS
Talleres
1 : 0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#0f141f] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isSource1
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-mono tracking-wider text-white uppercase">
                {sourceTitle}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{sourceDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          {/* External Links */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
              PORTAL SUMBER RESMI:
            </label>
            {sourceLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="p-3 rounded-xl bg-[#141b2a] hover:bg-[#1a2336] border border-slate-800 hover:border-amber-500/50 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-white group-hover:text-amber-300">
                    {link.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400">
                    {link.badge}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </a>
            ))}
          </div>

          {/* Quick Inject Data */}
          <div className="p-4 rounded-xl bg-[#141b2a] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400">
                ⚡ INJECT DATA DARI {isSource1 ? "SOURCE 1" : "SOURCE 2"}:
              </span>
              <button
                type="button"
                onClick={() => {
                  onQuickInjectSourceData(isSource1 ? quickSample1 : quickSample2);
                  onClose();
                }}
                className="px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-black uppercase transition-colors cursor-pointer"
              >
                Inject ke Generator
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Klik &quot;Inject ke Generator&quot; untuk langsung mengisi data pertandingan terpilih ke dalam teks editor.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
