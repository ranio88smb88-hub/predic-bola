import React, { useState } from "react";
import { X, Bot, Sparkles, Wand2, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedScript: (scriptText: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedScript,
}) => {
  const [promptInput, setPromptInput] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("UEFA Champions League");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/ai/parse-and-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: promptInput || "Buatkan 4 jadwal pertandingan bergengsi dengan prediksi skor",
          mode: promptInput ? "parse" : "generate",
          tournament: selectedLeague,
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.matches) {
        // Build multi-line script format from matches
        const matches = data.data.matches;
        const tournamentHeader = data.data.tournamentHeader || selectedLeague.toUpperCase();

        const lines: string[] = [tournamentHeader];
        matches.forEach((m: any) => {
          lines.push(m.time || "20:00");
          lines.push(m.wib || `WIB • ${m.date || "TODAY"}`);
          lines.push(m.homeTeam || "Home");
          lines.push("VS");
          lines.push(m.awayTeam || "Away");
          lines.push(m.score || "2 : 1");
        });

        const scriptString = lines.join("\n");
        setGeneratedOutput(scriptString);
      } else {
        // Fallback demo generation
        const fallbackScript = `${selectedLeague.toUpperCase()}\n20:00\nWIB • 30/07\nReal Madrid\nVS\nManchester City\n2 : 1\n\n22:30\nWIB • 30/07\nArsenal\nVS\nBayern Munich\n2 : 0`;
        setGeneratedOutput(fallbackScript);
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      // Generate standard fallback
      const fallbackScript = `${selectedLeague.toUpperCase()}\n20:00\nWIB • 30/07\nReal Madrid\nVS\nManchester City\n2 : 1\n\n22:30\nWIB • 30/07\nArsenal\nVS\nBayern Munich\n2 : 0`;
      setGeneratedOutput(fallbackScript);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedOutput) {
      onApplyGeneratedScript(generatedOutput);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f141f] border border-purple-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-mono tracking-wider text-white uppercase flex items-center gap-2">
                <span>GEMINI AI SCRIPT ASSISTANT</span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  SMART PARSER
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Otomatis rapikan teks chat Telegram/WA atau generate jadwal pertandingan baru
              </p>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          {/* Preset Tournament Selection */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5">
              PILIH TARGET LIGA / TURNAMEN:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                "UEFA Champions League",
                "English Premier League",
                "Copa Libertadores",
                "BRI Liga 1 Indonesia",
                "ASEAN Championship",
                "World Cup Qualifiers",
              ].map((lg) => (
                <button
                  key={lg}
                  type="button"
                  onClick={() => setSelectedLeague(lg)}
                  className={`p-2 rounded-lg text-xs font-mono font-bold border text-left transition-all ${
                    selectedLeague === lg
                      ? "bg-purple-950/80 border-purple-400 text-purple-200"
                      : "bg-[#141b2a] border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {lg}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt / Paste Area */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5">
              PASTE TEKS CHAT BERANTAKAN ATAU TULIS PERINTAH:
            </label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={4}
              placeholder="Contoh: Tolong buatkan 3 pertandingan seru Liga Champions malam ini, atau paste format teks jadwal grup WA Anda di sini..."
              className="w-full bg-[#0a0d14] border border-slate-700 focus:border-purple-400 rounded-lg p-3 text-xs font-mono text-white outline-none leading-relaxed"
            />
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>MEMPROSES DENGAN GEMINI AI...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>GENERATE / PARSE OTOMATIS</span>
              </>
            )}
          </button>

          {/* Output Preview */}
          {generatedOutput && (
            <div className="space-y-2 p-3 rounded-xl bg-[#090c12] border border-slate-800 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>HASIL SCRIPT SIAP DIPAKAI</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {generatedOutput.split("\n").length} baris
                </span>
              </div>
              <pre className="p-3 bg-black/70 rounded-lg text-xs font-mono text-emerald-300 max-h-40 overflow-y-auto">
                <code>{generatedOutput}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>

          {generatedOutput && (
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-black uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              <span>TERAPKAN KE GENERATOR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
