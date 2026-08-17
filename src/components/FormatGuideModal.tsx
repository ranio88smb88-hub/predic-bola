import React from "react";
import { X, HelpCircle, CheckCircle2, Copy } from "lucide-react";

interface FormatGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExample: (text: string) => void;
}

export const FormatGuideModal: React.FC<FormatGuideModalProps> = ({
  isOpen,
  onClose,
  onApplyExample,
}) => {
  if (!isOpen) return null;

  const example1 = `ASEAN CHAMPIONSHIP 2026
18:00
WIB • 28/07
Philippines
VS
Myanmar
1 : 0
21:00
WIB • 28/07
Malaysia
VS
Laos
0 : 2`;

  const example2 = `UEFA CHAMPIONS LEAGUE QUALIFIERS
01:30
WIB • 29/07
Sparta Prague
VS
Shamrock Rovers
3 : 0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f141f] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-mono tracking-wider text-white uppercase">
                PANDUAN FORMAT SCRIPT
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Struktur baris teks yang didukung oleh parser otomatis
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          {/* Rule Breakdown */}
          <div className="p-4 rounded-xl bg-[#141b2a] border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold font-mono tracking-wider text-amber-400 uppercase">
              Urutan Baris Standar:
            </h4>
            <ul className="text-xs font-mono text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong className="text-white">Baris 1:</strong> Nama Liga/Turnamen (contoh: <code>COPA LIBERTADORES</code>)</li>
              <li><strong className="text-white">Baris 2:</strong> Jam Pertandingan (contoh: <code>01:30</code> atau <code>18:00</code>)</li>
              <li><strong className="text-white">Baris 3:</strong> Zona Waktu & Tanggal (contoh: <code>WIB • 29/07</code>)</li>
              <li><strong className="text-white">Baris 4:</strong> Nama Tim Tuan Rumah (contoh: <code>Sparta Prague</code>)</li>
              <li><strong className="text-white">Baris 5:</strong> Pemisah <code>VS</code></li>
              <li><strong className="text-white">Baris 6:</strong> Nama Tim Tamu (contoh: <code>Shamrock Rovers</code>)</li>
              <li><strong className="text-white">Baris 7:</strong> Prediksi Skor (contoh: <code>3 : 0</code> atau <code>2 : 1</code>)</li>
            </ul>
          </div>

          {/* Example 1 */}
          <div className="p-4 rounded-xl bg-[#141b2a] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Contoh Format 1 (ASEAN Championship):</span>
              <button
                type="button"
                onClick={() => {
                  onApplyExample(example1);
                  onClose();
                }}
                className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Gunakan Contoh Ini</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0a0d14] rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
              <code>{example1}</code>
            </pre>
          </div>

          {/* Example 2 */}
          <div className="p-4 rounded-xl bg-[#141b2a] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Contoh Format 2 (Champions League):</span>
              <button
                type="button"
                onClick={() => {
                  onApplyExample(example2);
                  onClose();
                }}
                className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Gunakan Contoh Ini</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0a0d14] rounded-lg text-xs font-mono text-amber-300 overflow-x-auto">
              <code>{example2}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-black uppercase transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
