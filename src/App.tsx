import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "./components/Header";
import { CustomizationPanel } from "./components/CustomizationPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { TemplateModal } from "./components/TemplateModal";
import { FormatGuideModal } from "./components/FormatGuideModal";
import { AiAssistantModal } from "./components/AiAssistantModal";
import { SettingsModal } from "./components/SettingsModal";
import { SourceModal } from "./components/SourceModal";
import { COLOR_THEMES } from "./data/themes";
import { WALLPAPER_OPTIONS } from "./data/wallpapers";
import { MATCH_TEMPLATES, MatchTemplate } from "./data/templates";
import { parseMatchScript } from "./utils/parser";
import { generateEmbedHtml } from "./utils/scriptGenerator";
import { batchResolveTeamLogos } from "./data/teamLogos";
import { AppSettings, MatchGroup, MatchItem } from "./types";
import { DEFAULT_SITE_LOGO_URL, DEFAULT_SITE_NAME, DEFAULT_KEYWORDS_TEXT } from "./data/branding";

const INITIAL_SCRIPT = `ASEAN CHAMPIONSHIP 2026
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
0 : 2

UEFA CHAMPIONS LEAGUE QUALIFIERS
23:00
WIB • 28/07
Fenerbahce
VS
Lugano
2 : 1
01:30
WIB • 29/07
Sparta Prague
VS
Shamrock Rovers
3 : 0

COPA LIBERTADORES
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

export default function App() {
  // State
  const [headerDate, setHeaderDate] = useState("TUESDAY, 28 JULY 2026");
  const [selectedThemeId, setSelectedThemeId] = useState("soft-royal-gold");
  const [selectedWallpaperId, setSelectedWallpaperId] = useState("night-stadium");
  const [rawScriptText, setRawScriptText] = useState(INITIAL_SCRIPT);
  const [isSyncingLogos, setIsSyncingLogos] = useState(false);

  // Modals state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isFormatGuideOpen, setIsFormatGuideOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSourceModal, setActiveSourceModal] = useState<number | null>(null);

  // App Settings with Site Branding & Special Match Controls
  const [settings, setSettings] = useState<AppSettings>({
    headerDate: "TUESDAY, 28 JULY 2026",
    selectedThemeId: "soft-royal-gold",
    selectedWallpaperId: "night-stadium",
    siteLogoUrl: DEFAULT_SITE_LOGO_URL,
    siteName: DEFAULT_SITE_NAME,
    keywordsText: DEFAULT_KEYWORDS_TEXT,
    customHeaderTagline: "PREDIKSI PASARAN DAN SCORE RESMI",
    watermarkText: "ROYAL PREDICTION ENGINE",
    sponsorName: "DAFTAR SEKARANG",
    sponsorUrl: "https://google.com",
    showSpecialMatch: true,
    specialMatchTitle: "PERTANDINGAN SPESIAL",
    specialMatchBadge: "BIG MATCH",
    autoSlideSpecial: false,
    slideIntervalSeconds: 6,
    showProbabilityBar: true,
    showMarketDetails: true,
    expandAllByDefault: false,
    targetPlatform: "blogger",
  });

  // Derived current Theme & Wallpaper
  const currentTheme = useMemo(() => {
    return COLOR_THEMES.find((t) => t.id === selectedThemeId) || COLOR_THEMES[0];
  }, [selectedThemeId]);

  const currentWallpaper = useMemo(() => {
    return WALLPAPER_OPTIONS.find((w) => w.id === selectedWallpaperId) || WALLPAPER_OPTIONS[0];
  }, [selectedWallpaperId]);

  // Parsed Matches State
  const [parsedGroups, setParsedGroups] = useState<MatchGroup[]>([]);
  const [totalDetected, setTotalDetected] = useState<number>(0);

  // Logo resolver helper
  const syncLogosForGroups = useCallback(async (groups: MatchGroup[]) => {
    const teamNames: string[] = [];
    groups.forEach((g) => {
      g.matches.forEach((m) => {
        if (m.homeTeam) teamNames.push(m.homeTeam);
        if (m.awayTeam) teamNames.push(m.awayTeam);
      });
    });

    if (teamNames.length === 0) return;

    try {
      const resolved = await batchResolveTeamLogos(teamNames);
      setParsedGroups((prev) =>
        prev.map((g) => ({
          ...g,
          matches: g.matches.map((m) => ({
            ...m,
            homeLogo: resolved[m.homeTeam] || m.homeLogo,
            awayLogo: resolved[m.awayTeam] || m.awayLogo,
          })),
        }))
      );
    } catch (e) {
      console.warn("Logo sync error:", e);
    }
  }, []);

  // Auto-parse on load and when rawScriptText changes
  useEffect(() => {
    const { groups, totalMatches } = parseMatchScript(rawScriptText);
    setParsedGroups(groups);
    setTotalDetected(totalMatches);

    // Asynchronously resolve real CDN badges from the 29,648+ database
    syncLogosForGroups(groups);
  }, [rawScriptText, syncLogosForGroups]);

  // Handle Generate Script CTA
  const handleGenerateScript = async () => {
    setIsSyncingLogos(true);
    const { groups, totalMatches } = parseMatchScript(rawScriptText);
    setParsedGroups(groups);
    setTotalDetected(totalMatches);

    await syncLogosForGroups(groups);

    setTimeout(() => {
      setIsSyncingLogos(false);
    }, 600);
  };

  // Toggle individual match card accordion
  const handleToggleMatchExpanded = (matchId: string) => {
    setParsedGroups((prev) =>
      prev.map((group) => ({
        ...group,
        matches: group.matches.map((m) =>
          m.id === matchId ? { ...m, isExpanded: !m.isExpanded } : m
        ),
      }))
    );
  };

  // Expand or collapse all cards
  const handleExpandAllMatches = (expand: boolean) => {
    setParsedGroups((prev) =>
      prev.map((group) => ({
        ...group,
        matches: group.matches.map((m) => ({ ...m, isExpanded: expand })),
      }))
    );
  };

  // Template select
  const handleSelectTemplate = (template: MatchTemplate) => {
    setRawScriptText(template.rawText);
  };

  // Settings update
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Generated standalone HTML code
  const generatedHtmlCode = useMemo(() => {
    return generateEmbedHtml(parsedGroups, currentTheme, currentWallpaper, {
      ...settings,
      headerDate,
    });
  }, [parsedGroups, currentTheme, currentWallpaper, settings, headerDate]);

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Header */}
      <Header
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenSourceModal={(num) => setActiveSourceModal(num)}
        isSyncingLogos={isSyncingLogos}
      />

      {/* Main Content Workspace: 2-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Generator & Customization Controls (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <CustomizationPanel
              headerDate={headerDate}
              onChangeHeaderDate={setHeaderDate}
              selectedWallpaperId={selectedWallpaperId}
              onChangeWallpaper={setSelectedWallpaperId}
              selectedThemeId={selectedThemeId}
              onSelectTheme={setSelectedThemeId}
              rawScriptText={rawScriptText}
              onChangeRawScript={setRawScriptText}
              detectedCount={totalDetected}
              onGenerateScript={handleGenerateScript}
              onOpenFormatGuide={() => setIsFormatGuideOpen(true)}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              onClearText={() => setRawScriptText("")}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>

          {/* Right Column: Live Preview & HTML Embed Code (7 cols) */}
          <div className="lg:col-span-7 w-full h-[780px] lg:h-[calc(100vh-140px)] sticky top-20">
            <PreviewPanel
              groups={parsedGroups}
              theme={currentTheme}
              wallpaper={currentWallpaper}
              settings={settings}
              generatedHtmlCode={generatedHtmlCode}
              onToggleMatchExpanded={handleToggleMatchExpanded}
              onExpandAllMatches={handleExpandAllMatches}
            />
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-[#06090e] py-4 px-6 text-center text-xs font-mono text-slate-500">
        <p>
          FOOTBALL SCRIPT GENERATOR &copy; 2026 // ROYAL EDITION // INTEGRATED GOOGLE APPS SCRIPT LOGO DATABASE (29,648+ CLUBS & TEAMS)
        </p>
      </footer>

      {/* Modals */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <FormatGuideModal
        isOpen={isFormatGuideOpen}
        onClose={() => setIsFormatGuideOpen(false)}
        onApplyExample={(text) => setRawScriptText(text)}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onApplyGeneratedScript={(text) => setRawScriptText(text)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <SourceModal
        sourceNum={activeSourceModal}
        onClose={() => setActiveSourceModal(null)}
        onQuickInjectSourceData={(data) => setRawScriptText(data)}
      />
    </div>
  );
}
