import React from "react";
import { X, FolderDown, Sparkles, Check, ChevronRight } from "lucide-react";
import { MATCH_TEMPLATES, MatchTemplate } from "../data/templates";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MatchTemplate) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f141f] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-mono tracking-wider text-white uppercase">
                LOAD MATCH SCRIPT TEMPLATE
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Pilih preset jadwal pertandingan siap pakai untuk digenerate langsung.
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

        {/* Template List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
          {MATCH_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl);
                onClose();
              }}
              className="p-4 rounded-xl bg-[#141b2a] hover:bg-[#1a2336] border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    {tmpl.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{tmpl.category}</span>
                </div>
                <h4 className="text-sm font-bold font-mono text-white group-hover:text-amber-300 transition-colors">
                  {tmpl.name}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 line-clamp-1">
                  {tmpl.rawText.split("\n").slice(0, 4).join(" • ")}...
                </p>
              </div>

              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-amber-400/10 group-hover:bg-amber-400 text-amber-300 group-hover:text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1 shrink-0"
              >
                <span>Pakai</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
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
