export interface MatchItem {
  id: string;
  league: string;
  time: string;
  date: string;
  wibString: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  homeLogo?: string;
  awayLogo?: string;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  hdp?: string;
  ou?: string;
  odds1x2?: string;
  bestPick?: string;
  insight?: string;
  isExpanded?: boolean;
  isSpecial?: boolean;
  specialHdpNote?: string;
  specialScoreNote?: string;
}

export interface MatchGroup {
  league: string;
  matches: MatchItem[];
}

export interface ColorTheme {
  id: string;
  name: string;
  categoryName: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  borderRgba: string;
  cardBg: string;
  cardBgHover?: string;
  cardBgActive?: string;
  headerGrad: string;
  textGlow: string;
  badgeBg: string;
  swatchGradient: string;
}

export interface WallpaperOption {
  id: string;
  name: string;
  cssBackground: string;
  overlayGradient: string;
  previewColor: string;
  imageUrl?: string;
}

export interface AppSettings {
  headerDate: string;
  selectedThemeId: string;
  selectedWallpaperId: string;
  siteLogoUrl: string;
  siteName: string;
  keywordsText: string;
  customHeaderTagline: string;
  watermarkText: string;
  sponsorName: string;
  sponsorUrl: string;
  showSpecialMatch: boolean;
  specialMatchTitle: string;
  specialMatchBadge: string;
  autoSlideSpecial: boolean;
  slideIntervalSeconds: number;
  showProbabilityBar: boolean;
  showMarketDetails: boolean;
  expandAllByDefault: boolean;
  targetPlatform: "blogger" | "wordpress" | "html" | "forum";
  logoDatabaseUrl?: string;
  customTeamLogos?: Record<string, string>;
}

export interface TeamLogoItem {
  name: string;
  url: string;
}
