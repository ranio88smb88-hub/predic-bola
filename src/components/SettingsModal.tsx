import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Settings,
  Image as ImageIcon,
  Key,
  Flame,
  Database,
  RefreshCw,
  CheckCircle2,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Search,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { AppSettings } from "../types";
import { DEFAULT_SITE_LOGO_URL, DEFAULT_SITE_NAME, DEFAULT_KEYWORDS_TEXT } from "../data/branding";
import {
  DEFAULT_DATABASE_URL,
  getStoredCustomLogos,
  getStoredDatabaseUrl,
  setStoredCustomLogos,
  setStoredDatabaseUrl,
} from "../data/teamLogos";

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
  const [logoStats, setLogoStats] = useState<{
    count: number;
    customCount: number;
    total: number;
    loaded: boolean;
    loading: boolean;
    source: string;
  }>({
    count: 29648,
    customCount: 0,
    total: 29648,
    loaded: true,
    loading: false,
    source: DEFAULT_DATABASE_URL,
  });

  const [dbUrlInput, setDbUrlInput] = useState<string>(
    settings.logoDatabaseUrl || getStoredDatabaseUrl()
  );
  const [isReloadingLogos, setIsReloadingLogos] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Custom logo input form
  const [newTeamName, setNewTeamName] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [customLogosMap, setCustomLogosMap] = useState<Record<string, string>>(() => {
    return settings.customTeamLogos || getStoredCustomLogos();
  });
  const [bulkInputText, setBulkInputText] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const teamLogoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDbUrlInput(settings.logoDatabaseUrl || getStoredDatabaseUrl());
      setCustomLogosMap(settings.customTeamLogos || getStoredCustomLogos());

      fetch("/api/logos/status")
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setLogoStats({
              count: data.count || 29648,
              customCount: data.customCount || 0,
              total: data.total || data.count || 29648,
              loaded: !!data.loaded,
              loading: !!data.loading,
              source: data.source || DEFAULT_DATABASE_URL,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen, settings.logoDatabaseUrl, settings.customTeamLogos]);

  // Sync / Reload Database URL
  const handleSaveAndSyncDatabase = async () => {
    setIsReloadingLogos(true);
    setSyncStatusMsg(null);
    const cleanUrl = dbUrlInput.trim();

    try {
      setStoredDatabaseUrl(cleanUrl);
      onUpdateSettings({ logoDatabaseUrl: cleanUrl, customTeamLogos: customLogosMap });

      const res = await fetch("/api/logos/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          databaseUrl: cleanUrl,
          customLogos: customLogosMap,
          reload: true,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setLogoStats({
          count: data.count,
          customCount: data.customCount || Object.keys(customLogosMap).length,
          total: data.total || data.count,
          loaded: true,
          loading: false,
          source: data.source || cleanUrl,
        });
        setSyncStatusMsg(`Berhasil sinkronisasi! ${data.count.toLocaleString()} tim terindeks.`);
      }
    } catch (e: any) {
      console.error(e);
      setSyncStatusMsg("Gagal menghubungi server database. Menggunakan cache offline.");
    } finally {
      setIsReloadingLogos(false);
    }
  };

  const handleResetDefaultDatabaseUrl = () => {
    setDbUrlInput(DEFAULT_DATABASE_URL);
    setStoredDatabaseUrl(DEFAULT_DATABASE_URL);
    onUpdateSettings({ logoDatabaseUrl: DEFAULT_DATABASE_URL });
  };

  // Add individual team logo
  const handleAddCustomTeamLogo = () => {
    const cleanName = newTeamName.trim();
    const cleanUrl = newLogoUrl.trim();
    if (!cleanName || !cleanUrl) return;

    const updated = { ...customLogosMap, [cleanName]: cleanUrl };
    setCustomLogosMap(updated);
    setStoredCustomLogos(updated);
    onUpdateSettings({ customTeamLogos: updated });

    // Sync with backend API
    fetch("/api/logos/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customLogos: updated, reload: false }),
    }).catch(() => {});

    setNewTeamName("");
    setNewLogoUrl("");
    setSyncStatusMsg(`Logo tim "${cleanName}" berhasil disimpan ke database.`);
  };

  // Upload custom team logo image
  const handleTeamLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setNewLogoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete custom team logo
  const handleDeleteCustomLogo = (teamName: string) => {
    const updated = { ...customLogosMap };
    delete updated[teamName];
    setCustomLogosMap(updated);
    setStoredCustomLogos(updated);
    onUpdateSettings({ customTeamLogos: updated });
  };

  // Bulk import team logos
  const handleBulkImport = () => {
    if (!bulkInputText.trim()) return;
    const lines = bulkInputText.split("\n");
    const newMappings: Record<string, string> = { ...customLogosMap };
    let importedCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) continue;

      let name = "";
      let url = "";

      if (trimmed.includes("=")) {
        const parts = trimmed.split("=");
        name = parts[0].trim();
        url = parts.slice(1).join("=").trim();
      } else if (trimmed.includes("|")) {
        const parts = trimmed.split("|");
        name = parts[0].trim();
        url = parts.slice(1).join("|").trim();
      } else if (trimmed.includes(",")) {
        const parts = trimmed.split(",");
        name = parts[0].trim();
        url = parts.slice(1).join(",").trim();
      }

      if (name && url && (url.startsWith("http") || url.startsWith("data:image/"))) {
        newMappings[name] = url;
        importedCount++;
      }
    }

    if (importedCount > 0) {
      setCustomLogosMap(newMappings);
      setStoredCustomLogos(newMappings);
      onUpdateSettings({ customTeamLogos: newMappings });

      fetch("/api/logos/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customLogos: newMappings, reload: false }),
      }).catch(() => {});

      setBulkInputText("");
      setShowBulkInput(false);
      setSyncStatusMsg(`Berhasil mengimpor ${importedCount} logo tim ke database.`);
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

  const filteredCustomList = Object.entries(customLogosMap).filter(([name]) =>
    name.toLowerCase().includes(customSearchQuery.toLowerCase().trim())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0d121c] border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-[0_10px_50px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-mono tracking-wider text-white uppercase">
                PENGATURAN DATABASE, LOGO & EMBED
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Kelola database logo tim (Google Sheet/Apps Script), input logo kustom, dan branding situs
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

        {/* Sync Notification Banner */}
        {syncStatusMsg && (
          <div className="my-2 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
            <button
              onClick={() => setSyncStatusMsg(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Tabs / Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-5 custom-scrollbar">
          {/* ================= SECTION 1: DATABASE LOGO TIM (GOOGLE SHEETS / APPS SCRIPT) ================= */}
          <div className="p-4 rounded-xl bg-[#131926] border border-amber-500/30 space-y-3.5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Database className="w-4 h-4" />
                <h4 className="text-xs font-black font-mono tracking-wider uppercase">
                  DATABASE LOGO TIM (GOOGLE APPS SCRIPT / GOOGLE SHEETS)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/90 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE ({logoStats.count.toLocaleString()} Tim Terindeks)</span>
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              Masukkan URL Database Web App Google Apps Script atau API JSON Anda untuk mengambil logo tim secara otomatis:
            </p>

            {/* URL Input Box */}
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={dbUrlInput}
                  onChange={(e) => setDbUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-xs font-mono text-white outline-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAndSyncDatabase}
                    disabled={isReloadingLogos}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md whitespace-nowrap"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReloadingLogos ? "animate-spin" : ""}`} />
                    <span>{isReloadingLogos ? "Sinkronisasi..." : "Test & Sinkronkan"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaultDatabaseUrl}
                    className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap"
                    title="Kembalikan ke Database Default"
                  >
                    Reset URL
                  </button>
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Database ini otomatis dimuat saat aplikasi dijalankan dan saat tombol 'Buat Script' ditekan.
              </p>
            </div>
          </div>

          {/* ================= SECTION 2: INPUT DATABASE LOGO TIM KUSTOM ================= */}
          <div className="p-4 rounded-xl bg-[#131926] border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <FileSpreadsheet className="w-4 h-4" />
                <h4 className="text-xs font-black font-mono tracking-wider uppercase">
                  INPUT LOGO TIM SENDIRI (PRIORITAS UTAMA)
                </h4>
              </div>

              <span className="text-xs font-mono text-amber-400/90 font-bold">
                {Object.keys(customLogosMap).length} Tim Kustom Tersimpan
              </span>
            </div>

            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Jika ada tim yang logonya belum ada di Google Sheet atau ingin Anda ganti sendiri, tambahkan di sini. Logo yang Anda input akan memiliki <strong className="text-amber-400">prioritas tertinggi</strong>!
            </p>

            {/* Input Form */}
            <div className="p-3 rounded-lg bg-[#0a0d14] border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-slate-300 block uppercase">
                Tambah Logo Tim Baru:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Nama Tim (misal: Persija / Al Nassr)"
                    className="w-full bg-[#131926] border border-slate-700 focus:border-amber-400 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-5 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newLogoUrl}
                    onChange={(e) => setNewLogoUrl(e.target.value)}
                    placeholder="URL Logo (https://... atau upload)"
                    className="flex-1 bg-[#131926] border border-slate-700 focus:border-amber-400 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />

                  <input
                    type="file"
                    ref={teamLogoFileInputRef}
                    onChange={handleTeamLogoFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => teamLogoFileInputRef.current?.click()}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-mono font-bold shrink-0 cursor-pointer"
                    title="Upload File Gambar Logo"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddCustomTeamLogo}
                    disabled={!newTeamName.trim() || !newLogoUrl.trim()}
                    className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Simpan Logo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Paste Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowBulkInput(!showBulkInput)}
                  className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{showBulkInput ? "▼ Tutup Tempel Massal" : "▶ Tempel Massal / Bulk Import (Banyak Tim Sekaligus)"}</span>
                </button>

                {Object.keys(customLogosMap).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Hapus semua logo tim kustom yang sudah diinput?")) {
                        setCustomLogosMap({});
                        setStoredCustomLogos({});
                        onUpdateSettings({ customTeamLogos: {} });
                      }
                    }}
                    className="text-[11px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus Semua</span>
                  </button>
                )}
              </div>

              {showBulkInput && (
                <div className="mt-2 p-3 rounded-lg bg-[#0a0d14] border border-slate-800 space-y-2">
                  <p className="text-[11px] font-mono text-slate-400">
                    Tempel daftar nama tim dan URL logo (format: <code className="text-amber-400">Nama Tim = URL Logo</code>):
                  </p>
                  <textarea
                    rows={4}
                    value={bulkInputText}
                    onChange={(e) => setBulkInputText(e.target.value)}
                    placeholder={`Persija = https://example.com/persija.png\nPersib = https://example.com/persib.png\nAl Nassr = https://example.com/alnassr.png`}
                    className="w-full bg-[#131926] border border-slate-700 rounded-lg p-2 text-xs font-mono text-white outline-none font-mono resize-y"
                  />
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    disabled={!bulkInputText.trim()}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Impor ke Database</span>
                  </button>
                </div>
              )}
            </div>

            {/* List of Custom Team Logos */}
            {Object.keys(customLogosMap).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                    Daftar Tim Kustom Anda:
                  </span>
                  <div className="relative w-44">
                    <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2.5" />
                    <input
                      type="text"
                      value={customSearchQuery}
                      onChange={(e) => setCustomSearchQuery(e.target.value)}
                      placeholder="Cari tim kustom..."
                      className="w-full pl-6 pr-2 py-1 bg-[#0a0d14] border border-slate-700 rounded text-[11px] font-mono text-white outline-none"
                    />
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto custom-scrollbar rounded-lg border border-slate-800 bg-[#0a0d14] divide-y divide-slate-800/80">
                  {filteredCustomList.length === 0 ? (
                    <div className="p-3 text-center text-xs font-mono text-slate-500">
                      Tidak ada tim yang cocok dengan pencarian
                    </div>
                  ) : (
                    filteredCustomList.map(([name, url]) => (
                      <div
                        key={name}
                        className="p-2 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-black/60 border border-amber-500/40 p-0.5 flex items-center justify-center shrink-0">
                            <img
                              src={url}
                              alt={name}
                              className="w-full h-full object-contain rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://flagcdn.com/w320/un.png";
                              }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-white uppercase truncate">
                            {name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px] hidden sm:inline">
                            {url}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomLogo(name)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Hapus Logo Tim"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ================= SECTION 3: LOGO SITUS GAMBAR & BRANDING ================= */}
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

          {/* ================= SECTION 4: KATA-KATA KUNCI ================= */}
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

          {/* ================= SECTION 5: PERTANDINGAN SPESIAL ================= */}
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

          {/* ================= SECTION 6: TARGET PLATFORM ================= */}
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
            Perubahan otomatis tersimpan dan terupdate di live preview & script embed.
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
