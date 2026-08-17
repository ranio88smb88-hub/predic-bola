import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Settings,
  Sliders,
  Sparkles,
  Image as ImageIcon,
  Key,
  Flame,
  Database,
  RefreshCw,
  CheckCircle2,
  Upload,
  RotateCcw,
} from "lucide-react";
import { AppSettings } from "../types";
import { DEFAULT_SITE_LOGO_URL, DEFAULT_SITE_NAME, DEFAULT_KEYWORDS_TEXT } from "../data/branding";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [logoStats, setLogoStats] = useState<{ count: number; loaded: boolean; loading: boolean }>({
    count: 29648,
    loaded: true,
    loading: false,
  });
  const [isReloadingLogos, setIsReloadingLogos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/logos/status")
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setLogoStats({
              count: data.count || 29648,
              loaded: !!data.loaded,
              loading: !!data.loading,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleReloadLogos = async () => {
    setIsReloadingLogos(true);
    try {
      const res = await fetch("/api/logos/reload", { method: "POST" });
      const data = await res.json();
      if (data && data.success) {
        setLogoStats({ count: data.count, loaded: true, loading: false });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReloadingLogos(false);
    }
  };

  // Handle local image file upload for site logo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onUpdateSettings({ siteLogoUrl: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultLogo = () => {
    onUpdateSettings({
      siteLogoUrl: DEFAULT_SITE_LOGO_URL,
      siteName: DEFAULT_SITE_NAME,
      keywordsText: DEFAULT_KEYWORDS_TEXT,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0d121c] border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-[0_10px_50px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-mono tracking-wider text-white uppercase">
                PENGATURAN LOGO, KATA KUNCI & EMBED
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Kustomisasi logo situs gambar, kata-kata kunci, dan tampilan pertandingan spesial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar">
          {/* Section 1: Logo Situs Gambar & Branding */}
          <div className="p-4 rounded-xl bg-[#131926] border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <ImageIcon className="w-4 h-4" />
                <h4 className="text-xs font-black font-mono tracking-wider uppercase">
                  LOGO SITUS GAMBAR & BRANDING
                </h4>
              </div>

              <button
                type="button"
                onClick={handleResetToDefaultLogo}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Logo Default (LigaBandot)</span>
              </button>
            </div>

            {/* Logo Image Input & Upload */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                URL ATAU UPLOAD GAMBAR LOGO SITUS:
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={settings.siteLogoUrl}
                  onChange={(e) => onUpdateSettings({ siteLogoUrl: e.target.value })}
                  placeholder="https://example.com/logo-situs.png atau data:image/..."
                  className="flex-1 bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-xs font-mono text-white outline-none"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Upload Gambar dari Komputer/HP"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>

                {/* Thumbnail Preview */}
                <div className="w-12 h-10 rounded-lg bg-black/70 border border-amber-500/40 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={settings.siteLogoUrl || DEFAULT_SITE_LOGO_URL}
                    alt="Site Logo Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_SITE_LOGO_URL;
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                Logo ini akan ditampilkan di kartu header atas script embed dan preview live.
              </p>
            </div>

            {/* Nama Situs */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                NAMA SITUS / BRAND TITLE:
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => onUpdateSettings({ siteName: e.target.value })}
                placeholder="LigaBandot"
                className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-lg p-2 text-xs font-mono text-white outline-none"
              />
            </div>
          </div>

          {/* Section 2: Kata-Kata Kunci (Keywords / Running Text / SEO) */}
          <div className="p-4 rounded-xl bg-[#131926] border border-slate-800 space-y-3.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Key className="w-4 h-4" />
              <h4 className="text-xs font-black font-mono tracking-wider uppercase">
                KATA-KATA KUNCI (KEYWORDS & RUNNING TICKER)
              </h4>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                TEKS KATA KUNCI / RUNNING BAR TEXT:
              </label>
              <textarea
                rows={3}
                value={settings.keywordsText}
                onChange={(e) => onUpdateSettings({ keywordsText: e.target.value })}
                placeholder="PASARAN TERLENGKAP DAN PREDIKSI AKURAT SETIAP HARI - PARLAY TERBAIK ✦ 👑 VIP BOCORAN JITU ✦ LIGA EROPA & ASIA TERLENGKAP"
                className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-xs font-mono text-white outline-none resize-y"
              />
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                Kata kunci ini ditampilkan pada banner kartu tepat di bawah logo situs dan tanggal.
              </p>
            </div>
          </div>

          {/* Section 3: Pertandingan Spesial (Special Match Banner) */}
          <div className="p-4 rounded-xl bg-[#131926] border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <Flame className="w-4 h-4 fill-current" />
                <h4 className="text-xs font-black font-mono tracking-wider uppercase">
                  TAMPILAN PERTANDINGAN SPESIAL (CAROUSEL)
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-mono text-slate-300">Aktifkan</span>
                <input
                  type="checkbox"
                  checked={settings.showSpecialMatch}
                  onChange={(e) => onUpdateSettings({ showSpecialMatch: e.target.checked })}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
              </label>
            </div>

            {settings.showSpecialMatch && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                      JUDUL BANNER ATAS:
                    </label>
                    <input
                      type="text"
                      value={settings.specialMatchTitle}
                      onChange={(e) => onUpdateSettings({ specialMatchTitle: e.target.value })}
                      placeholder="PERTANDINGAN SPESIAL"
                      className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                      BADGE SOROTAN:
                    </label>
                    <input
                      type="text"
                      value={settings.specialMatchBadge}
                      onChange={(e) => onUpdateSettings({ specialMatchBadge: e.target.value })}
                      placeholder="BIG MATCH"
                      className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-slate-800">
                  <span className="text-xs font-mono text-slate-300">
                    Otomatis Geser Slide Carousel (Auto-Play)
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.autoSlideSpecial}
                    onChange={(e) => onUpdateSettings({ autoSlideSpecial: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Database Logo Tim Sepak Bola Status */}
          <div className="p-4 rounded-xl bg-[#131926] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <Database className="w-4 h-4" />
                <h4 className="text-xs font-black font-mono tracking-wider uppercase">
                  DATABASE LOGO TIM SEPAK BOLA
                </h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3" />
                <span>ONLINE ({logoStats.count.toLocaleString()} Tim)</span>
              </span>
            </div>

            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Terkoneksi langsung ke Google Apps Script Database. Logo tim, bendera negara, dan emblem klub otomatis disinkronkan.
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-slate-500 truncate max-w-[280px]">
                Google Apps Script Exec API
              </span>
              <button
                type="button"
                onClick={handleReloadLogos}
                disabled={isReloadingLogos}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReloadingLogos ? "animate-spin" : ""}`} />
                <span>{isReloadingLogos ? "Sinkronisasi..." : "Sinkron Ulang"}</span>
              </button>
            </div>
          </div>

          {/* Section 5: Target Platform Optimization */}
          <div className="p-4 rounded-xl bg-[#131926] border border-slate-800 space-y-2.5">
            <label className="text-xs font-mono font-bold text-slate-300 block">
              OPTIMASI TARGET PLATFORM EMBED:
            </label>
            <select
              value={settings.targetPlatform}
              onChange={(e) => onUpdateSettings({ targetPlatform: e.target.value as any })}
              className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white outline-none"
            >
              <option value="blogger">Blogger / Blogspot (Responsive iFrame & Inline HTML)</option>
              <option value="wordpress">WordPress Custom HTML Widget & Gutenberg Block</option>
              <option value="html">Standard HTML5 & Standalone Landing Page</option>
              <option value="forum">XenForo / vBulletin / Forum BBCode</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Perubahan otomatis tersimpan dan terupdate di live preview & script.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] cursor-pointer"
          >
            Terapkan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
