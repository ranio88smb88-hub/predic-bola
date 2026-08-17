import { MatchGroup, ColorTheme, WallpaperOption, AppSettings } from "../types";
import { DEFAULT_SITE_LOGO_URL, DEFAULT_SITE_NAME, DEFAULT_KEYWORDS_TEXT } from "../data/branding";

export function generateEmbedHtml(
  groups: MatchGroup[],
  theme: ColorTheme,
  wallpaper: WallpaperOption,
  settings: AppSettings
): string {
  // Extract all matches & special matches
  const allMatches = groups.flatMap((g) => g.matches);
  const explicitSpecial = allMatches.filter((m) => m.isSpecial);
  const specialMatches =
    explicitSpecial.length > 0
      ? explicitSpecial
      : allMatches
          .filter(
            (m) =>
              m.league.toLowerCase().includes("asean") ||
              m.homeTeam.toLowerCase().includes("philippines") ||
              m.homeTeam.toLowerCase().includes("malaysia") ||
              m.homeTeam.toLowerCase().includes("fenerbahce")
          )
          .concat(allMatches)
          .slice(0, 3);

  const siteLogoSource = settings.siteLogoUrl || DEFAULT_SITE_LOGO_URL;
  const siteName = settings.siteName || DEFAULT_SITE_NAME;
  const keywordsText = settings.keywordsText || DEFAULT_KEYWORDS_TEXT;
  const headerDateText = settings.headerDate || "TUESDAY, 28 JULY 2026";

  const specialBgStyle = wallpaper.imageUrl
    ? `linear-gradient(to bottom, rgba(8, 10, 16, 0.72) 0%, rgba(4, 6, 11, 0.88) 100%), url('${wallpaper.imageUrl}')`
    : wallpaper.cssBackground;

  // Generate Special Match Slides
  let specialSlidesHtml = "";
  if (settings.showSpecialMatch && specialMatches.length > 0) {
    specialSlidesHtml = specialMatches
      .map((m, idx) => {
        const hdpDisplay = m.hdp || "0 : 1/2";
        const hdpNote = m.specialHdpNote || (idx === 1 ? "Tamu Diunggulkan" : "Favorit Tuan Rumah");
        const scoreDisplay = m.score || "1 : 0";
        const scoreNote = m.specialScoreNote || (idx === 1 ? "Under 2.5 (Pertahanan Rapat)" : "Under 2.0 (Adu Taktik)");
        const badgeLabel = idx === 0 ? `🔥 ${settings.specialMatchBadge || "BIG MATCH"}` : idx === 1 ? "🔥 MATCH DAY" : "🔥 SUPER MATCH";

        return `        <div class="royal-special-slide ${idx === 0 ? "royal-special-slide-active" : ""}" data-slide-index="${idx}">
          <div class="royal-special-badge-wrap">
            <span class="royal-special-badge">${badgeLabel}</span>
          </div>
          <div class="royal-special-league">${m.league.toUpperCase()}</div>
          
          <div class="royal-special-teams-row">
            <!-- Home Team -->
            <div class="royal-special-team">
              <div class="royal-special-logo-box">
                <img src="${m.homeLogo || ""}" alt="${m.homeTeam}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://flagcdn.com/w320/un.png';" />
              </div>
              <span class="royal-special-team-name">${m.homeTeam}</span>
            </div>

            <!-- VS Center -->
            <div class="royal-special-center">
              <span class="royal-special-vs">VS</span>
              <span class="royal-special-date">${m.date ? `${m.date} • ` : ""}${m.time} WIB</span>
            </div>

            <!-- Away Team -->
            <div class="royal-special-team">
              <div class="royal-special-logo-box">
                <img src="${m.awayLogo || ""}" alt="${m.awayTeam}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://flagcdn.com/w320/un.png';" />
              </div>
              <span class="royal-special-team-name">${m.awayTeam}</span>
            </div>
          </div>

          <!-- Pasaran & Prediksi Boxes -->
          <div class="royal-special-stats-row">
            <div class="royal-special-stat-card">
              <span class="royal-spec-label">PASARAN HDP</span>
              <span class="royal-spec-val cyan-num">${hdpDisplay}</span>
              <span class="royal-spec-sub gold-text">${hdpNote}</span>
            </div>
            <div class="royal-special-stat-card">
              <span class="royal-spec-label">PREDIKSI SKOR</span>
              <span class="royal-spec-val gold-num">${scoreDisplay}</span>
              <span class="royal-spec-sub cyan-text">${scoreNote}</span>
            </div>
          </div>
        </div>`;
      })
      .join("\n\n");
  }

  // League options for dropdown
  const uniqueLeagues = Array.from(new Set(groups.map((g) => g.league)));
  const leagueOptionsHtml = uniqueLeagues
    .map((l) => {
      const matchCount = groups.find((g) => g.league === l)?.matches.length || 0;
      return `<option value="${l}">${l} (${matchCount} Match)</option>`;
    })
    .join("\n");

  // Generate Main Fixtures
  const fixturesHtml = groups
    .map((group) => {
      const matchCards = group.matches
        .map((m) => {
          const scoreParts = (m.score || "1 : 0").split(":").map((s) => s.trim());
          const scoreHome = scoreParts[0] || "0";
          const scoreAway = scoreParts[1] || "0";
          const searchTokens = `${m.homeTeam} ${m.awayTeam} ${group.league}`.toLowerCase();
          const matchUid = `match-${Math.random().toString(36).substring(2, 9)}`;

          return `        <!-- Match Card: ${m.homeTeam} vs ${m.awayTeam} -->
        <div class="royal-match-card ${m.isExpanded ? "is-revealed" : ""}" data-match-id="${matchUid}" data-search="${searchTokens}" onclick="window.royalToggleReveal(this)">
          <div class="royal-teams-row">
            <!-- Home Team -->
            <div class="royal-team royal-team-home">
              <div class="royal-logo-wrapper">
                <img src="${m.homeLogo || ""}" alt="${m.homeTeam}" class="royal-team-logo" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://flagcdn.com/w320/un.png';" />
              </div>
              <span class="royal-team-name">${m.homeTeam.toUpperCase()}</span>
            </div>

            <!-- Score & Time Center -->
            <div class="royal-center-meta">
              <span class="royal-vs-badge">VS</span>
              
              <div class="royal-score-box">
                <span class="royal-score-val">${scoreHome}</span>
                <span class="royal-score-sep">:</span>
                <span class="royal-score-val">${scoreAway}</span>
              </div>

              <span class="royal-date-time">${m.date ? `${m.date} • ` : ""}${m.time} WIB</span>
            </div>

            <!-- Away Team -->
            <div class="royal-team royal-team-away">
              <div class="royal-logo-wrapper">
                <img src="${m.awayLogo || ""}" alt="${m.awayTeam}" class="royal-team-logo" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://flagcdn.com/w320/un.png';" />
              </div>
              <span class="royal-team-name">${m.awayTeam.toUpperCase()}</span>
            </div>
          </div>

          <!-- Win Probability Bar Indicator -->
          <div class="royal-meter-container">
            <div class="royal-meter-bar royal-meter-home" style="width: ${m.homeProb}%;"></div>
            <div class="royal-meter-bar royal-meter-away" style="width: ${m.awayProb}%;"></div>
          </div>

          <!-- 4-Grid Probability & Prediction Analytics (Revealed on Click) -->
          <div class="royal-stats-grid royal-revealed-elem">
            <div class="royal-stat-box">
              <span class="royal-stat-label">HANDICAP</span>
              <span class="royal-stat-value cyan-val">${m.hdp || "0 : 1/2"}</span>
              <span class="royal-stat-sub gold-val">${m.specialHdpNote || "Favorit Tuan Rumah"}</span>
            </div>
            <div class="royal-stat-box">
              <span class="royal-stat-label">OVER/UNDER</span>
              <span class="royal-stat-value cyan-val">${m.ou || "Under 2.5"}</span>
              <span class="royal-stat-sub gold-val">${m.specialScoreNote || "Adu Taktik"}</span>
            </div>
            <div class="royal-stat-box">
              <span class="royal-stat-label">1X2 ODDS</span>
              <span class="royal-stat-value cyan-val">${m.odds1x2 || "Tuan Rumah Menang"}</span>
              <span class="royal-stat-sub">Match Pick</span>
            </div>
            <div class="royal-stat-box">
              <span class="royal-stat-label">ACCURACY</span>
              <span class="royal-stat-value cyan-val">${m.score || "1 : 0"}</span>
              <span class="royal-stat-sub">Precision</span>
            </div>
          </div>

          <!-- Revealed Close Action -->
          <div class="royal-close-detail-wrap royal-revealed-elem">
            <span class="royal-close-detail-btn">TUTUP DETAIL ▲</span>
          </div>

          <!-- Clean DETAIL Action Button -->
          <div class="royal-detail-btn-wrap royal-locked-elem">
            <span class="royal-detail-btn">DETAIL ▼</span>
          </div>
        </div>`;
        })
        .join("\n\n");

      return `      <!-- League Section: ${group.league} -->
      <div class="royal-league-group" data-league-name="${group.league}">
        <div class="royal-league-header">
          <div class="royal-header-line"></div>
          <div class="royal-league-title-wrap">
            <span class="royal-trophy-icon">🏆</span>
            <h3 class="royal-league-title">${group.league.toUpperCase()}</h3>
          </div>
          <div class="royal-header-line"></div>
        </div>
        <div class="royal-matches-list">
${matchCards}
        </div>
      </div>`;
    })
    .join("\n\n");

  const totalSpecialCount = specialMatches.length || 1;

  return `<!-- ========================================================
  FOOTBALL PREDICTIONS WIDGET - ROYAL EDITION
  Interactive Click-to-Reveal Engine with Glowing Hover & Clean Spacing
======================================================== -->
<div id="royal-predictions-widget" class="royal-theme-${theme.id}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Orbitron:wght@600;700;800;900&family=Rajdhani:wght@600;700;800&display=swap');

    #royal-predictions-widget {
      --royal-primary: ${theme.primary};
      --royal-secondary: ${theme.secondary};
      --royal-accent: ${theme.accent};
      --royal-glow: ${theme.glow};
      --royal-border: ${theme.primary};
      --royal-card-bg: ${theme.cardBg};
      --royal-card-bg-hover: ${theme.cardBgHover || theme.cardBg};
      --royal-card-bg-active: ${theme.cardBgActive || theme.cardBg};
      --royal-badge-bg: ${theme.badgeBg};
      
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: rgba(6, 8, 13, 0.45);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 16px;
      max-width: 672px;
      margin: 0 auto;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
    }

    @media (min-width: 640px) {
      #royal-predictions-widget {
        padding: 24px;
      }
    }

    #royal-predictions-widget * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .royal-content-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
    }

    @keyframes royalMarqueeScroll {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }

    @keyframes royalFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* 1. Header Banner Exact to Image (Brand Logo + Beam Spotlight + Date) */
    .royal-header-card {
      position: relative;
      background: rgba(10, 13, 20, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--royal-border);
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      overflow: hidden;
      box-shadow: 0 0 30px var(--royal-glow);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    @media (min-width: 640px) {
      .royal-header-card {
        padding: 28px 20px;
      }
    }

    .royal-header-beam {
      position: absolute;
      top: 0;
      left: 25%;
      width: 190px;
      height: 100%;
      background: linear-gradient(180deg, var(--royal-glow), transparent);
      transform: rotate(12deg);
      filter: blur(24px);
      pointer-events-none;
      opacity: 0.8;
    }

    .royal-header-inner {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .royal-header-logo-wrap {
      position: relative;
      padding: 4px 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .royal-header-brand-img {
      max-height: 64px;
      max-width: 280px;
      width: auto;
      height: auto;
      object-fit: contain;
      filter: drop-shadow(0 0 15px var(--royal-primary));
    }

    @media (min-width: 640px) {
      .royal-header-brand-img {
        max-height: 80px;
        max-width: 360px;
      }
    }

    .royal-header-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px;
      font-weight: 900;
      color: var(--royal-primary);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-shadow: 0 0 15px var(--royal-glow);
    }

    @media (min-width: 640px) {
      .royal-header-title {
        font-size: 24px;
      }
    }

    .royal-header-subtitle {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: var(--royal-accent);
      letter-spacing: 2.5px;
      text-transform: uppercase;
      text-shadow: 0 0 8px var(--royal-glow);
    }

    @media (min-width: 640px) {
      .royal-header-subtitle {
        font-size: 13px;
      }
    }

    /* 2. Marquee Running Text */
    .royal-marquee-wrap {
      background: rgba(8, 12, 20, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      height: 40px;
      padding: 0 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      box-shadow: 0 0 15px var(--royal-glow);
    }

    .royal-marquee-inner {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      animation: royalMarqueeScroll 28s linear infinite;
    }

    .royal-marquee-inner:hover {
      animation-play-state: paused;
    }

    .royal-marquee-text {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 16px;
    }

    .royal-marquee-star {
      color: var(--royal-primary);
    }

    /* 3. Special Match Carousel with Custom Stadium Wallpaper */
    .royal-special-section {
      display: flex;
      flex-direction: column;
      padding-top: 4px;
    }

    .royal-special-badge-header {
      display: flex;
      justify-content: center;
      margin-bottom: -12px;
      position: relative;
      z-index: 20;
    }

    .royal-special-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 20px;
      border-radius: 9999px;
      background: rgba(10, 14, 23, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1.5px solid var(--royal-border);
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 900;
      color: var(--royal-primary);
      letter-spacing: 1.8px;
      text-transform: uppercase;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 12px var(--royal-glow);
    }

    @media (min-width: 640px) {
      .royal-special-pill {
        font-size: 12px;
      }
    }

    .royal-special-card {
      position: relative;
      border-radius: 16px;
      border: 2px solid var(--royal-border);
      overflow: hidden;
      background: ${specialBgStyle};
      background-size: cover;
      background-position: center;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 0 30px var(--royal-glow);
      padding-top: 8px;
    }

    .royal-stadium-spotlight {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 75%;
      height: 96px;
      filter: blur(36px);
      pointer-events-none;
      opacity: 0.4;
      background: radial-gradient(circle, var(--royal-primary), transparent);
    }

    .royal-special-slide {
      display: none;
      position: relative;
      z-index: 10;
      padding: 20px 16px;
      text-align: center;
    }

    @media (min-width: 640px) {
      .royal-special-slide {
        padding: 28px 24px;
      }
    }

    .royal-special-slide.royal-special-slide-active {
      display: block;
      animation: royalFadeIn 0.35s ease;
    }

    .royal-special-badge-wrap {
      margin-bottom: 8px;
    }

    .royal-special-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 16px;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--royal-primary), var(--royal-accent));
      color: #000000;
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      box-shadow: 0 0 12px var(--royal-glow);
    }

    @media (min-width: 640px) {
      .royal-special-badge {
        font-size: 12px;
      }
    }

    .royal-special-league {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 800;
      color: var(--royal-accent);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 16px;
      text-shadow: 0 0 8px var(--royal-glow);
    }

    @media (min-width: 640px) {
      .royal-special-league {
        font-size: 14px;
      }
    }

    .royal-special-teams-row {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      justify-items: center;
      gap: 10px;
      margin: 8px 0 16px 0;
    }

    @media (min-width: 640px) {
      .royal-special-teams-row {
        gap: 18px;
      }
    }

    .royal-special-team {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: transform;
    }

    .royal-special-team:hover {
      transform: scale(1.18) translateY(-4px);
    }

    .royal-special-logo-box {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 2px solid var(--royal-border);
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 18px var(--royal-glow);
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      flex-shrink: 0;
    }

    @media (min-width: 640px) {
      .royal-special-logo-box {
        width: 80px;
        height: 80px;
      }
    }

    .royal-special-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .royal-special-team-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      max-width: 130px;
      line-height: 1.35;
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    @media (min-width: 640px) {
      .royal-special-team-name {
        font-size: 14px;
        max-width: 160px;
        min-height: 36px;
      }
    }

    /* Hover State on Special Match Team */
    .royal-special-team:hover .royal-special-logo-box {
      border-color: var(--royal-accent);
      transform: scale(1.22);
      box-shadow: 0 0 35px 12px var(--royal-glow), 0 0 20px var(--royal-accent);
    }

    .royal-special-team:hover .royal-special-logo-box img {
      transform: scale(1.12);
      filter: drop-shadow(0 0 14px var(--royal-glow));
    }

    .royal-special-team:hover .royal-special-team-name {
      transform: scale(1.08);
      color: var(--royal-accent);
      text-shadow: 0 0 12px var(--royal-glow);
    }

    .royal-special-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 4px;
    }

    .royal-special-vs {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 900;
      color: var(--royal-primary);
      text-shadow: 0 0 10px var(--royal-glow);
      letter-spacing: 1.5px;
    }

    @media (min-width: 640px) {
      .royal-special-vs {
        font-size: 14px;
      }
    }

    .royal-special-date {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 600;
      color: #cbd5e1;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 2px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      white-space: nowrap;
      letter-spacing: 0.5px;
    }

    @media (min-width: 640px) {
      .royal-special-date {
        font-size: 11px;
        padding: 2px 12px;
      }
    }

    .royal-special-stats-row {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    @media (min-width: 640px) {
      .royal-special-stats-row {
        gap: 16px;
      }
    }

    .royal-special-stat-card {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--royal-border);
      border-radius: 12px;
      padding: 10px 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    }

    @media (min-width: 640px) {
      .royal-special-stat-card {
        padding: 12px 14px;
      }
    }

    .royal-spec-label {
      font-family: 'Rajdhani', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #cbd5e1;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }

    @media (min-width: 640px) {
      .royal-spec-label {
        font-size: 12px;
      }
    }

    .royal-spec-val {
      font-family: 'Orbitron', sans-serif;
      font-size: 16px;
      font-weight: 800;
      margin: 2px 0;
    }

    @media (min-width: 640px) {
      .royal-spec-val {
        font-size: 20px;
      }
    }

    .cyan-num { color: #22d3ee; text-shadow: 0 0 8px rgba(34, 211, 238, 0.8); }
    .gold-num { color: var(--royal-primary); text-shadow: 0 0 10px var(--royal-glow); }
    .gold-text { color: var(--royal-primary); }
    .cyan-text { color: #67e8f9; }

    .royal-spec-sub {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 600;
    }

    @media (min-width: 640px) {
      .royal-spec-sub {
        font-size: 11px;
      }
    }

    /* Slider Controls with Soft Arrow Navigation Buttons */
    .royal-slider-controls {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    @media (min-width: 640px) {
      .royal-slider-controls {
        padding: 10px 24px;
      }
    }

    .royal-slider-arrow {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #cbd5e1;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      flex-shrink: 0;
    }

    .royal-slider-arrow:hover {
      background: rgba(255, 255, 255, 0.16);
      color: var(--royal-primary);
      border-color: var(--royal-border);
      transform: scale(1.12);
      box-shadow: 0 0 12px var(--royal-glow);
    }

    .royal-slider-arrow:active {
      transform: scale(0.92);
    }

    .royal-indicator-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .royal-slide-count-text {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 1px;
    }

    /* 4. Filter & Search Controls */
    .royal-filter-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      padding-top: 6px;
    }

    @media (min-width: 640px) {
      .royal-filter-row {
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
    }

    .royal-filter-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .royal-filter-label {
      font-family: 'Rajdhani', sans-serif;
      font-size: 12px;
      font-weight: 800;
      color: var(--royal-primary);
      letter-spacing: 1.2px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .royal-select-wrap, .royal-input-wrap {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
    }

    .royal-select {
      width: 100% !important;
      height: 44px !important;
      background: rgba(0, 0, 0, 0.4) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 2px solid var(--royal-border) !important;
      border-radius: 12px !important;
      padding: 0 38px 0 16px !important;
      color: var(--royal-primary) !important;
      font-family: 'Montserrat', sans-serif !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      outline: none !important;
      box-shadow: 0 0 10px var(--royal-glow) !important;
      transition: all 0.2s ease !important;
      box-sizing: border-box !important;
      cursor: pointer !important;
      appearance: none !important;
      -webkit-appearance: none !important;
    }

    .royal-select-wrap::after {
      content: "▼";
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
      color: var(--royal-primary);
      pointer-events-none;
    }

    .royal-select option {
      background: #0c1017;
      color: #ffffff;
    }

    .royal-input {
      width: 100% !important;
      height: 44px !important;
      background: rgba(0, 0, 0, 0.4) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 2px solid var(--royal-border) !important;
      border-radius: 12px !important;
      padding: 0 16px 0 46px !important;
      color: #ffffff !important;
      font-family: 'Montserrat', sans-serif !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      outline: none !important;
      box-shadow: 0 0 10px var(--royal-glow) !important;
      transition: all 0.2s ease !important;
      box-sizing: border-box !important;
    }

    .royal-input::placeholder {
      color: #94a3b8 !important;
      font-weight: 500 !important;
    }

    .royal-select:focus, .royal-input:focus {
      border-color: var(--royal-accent) !important;
      box-shadow: 0 0 15px var(--royal-glow) !important;
    }

    .royal-input-search-icon {
      position: absolute !important;
      left: 15px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 16px !important;
      height: 16px !important;
      color: var(--royal-primary) !important;
      opacity: 0.85 !important;
      pointer-events-none !important;
      z-index: 2 !important;
    }

    /* 5. League Section Header */
    .royal-league-group {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding-top: 12px;
    }

    .royal-league-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 4px 0;
    }

    .royal-header-line {
      height: 1.5px;
      flex: 1;
      background: linear-gradient(90deg, transparent, var(--royal-border));
    }

    .royal-league-header .royal-header-line:last-child {
      background: linear-gradient(90deg, var(--royal-border), transparent);
    }

    .royal-league-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
      text-align: center;
    }

    .royal-trophy-icon {
      font-size: 16px;
    }

    @media (min-width: 640px) {
      .royal-trophy-icon {
        font-size: 18px;
      }
    }

    .royal-league-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: var(--royal-primary);
      letter-spacing: 1.2px;
      text-shadow: 0 0 10px var(--royal-glow);
      text-transform: uppercase;
    }

    @media (min-width: 640px) {
      .royal-league-title {
        font-size: 16px;
      }
    }

    .royal-matches-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* 6. Match Card */
    .royal-match-card {
      position: relative;
      background: var(--royal-card-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      will-change: transform, box-shadow, border-color;
    }

    @media (min-width: 640px) {
      .royal-match-card {
        padding: 20px;
      }
    }

    .royal-match-card:hover {
      border-color: var(--royal-accent);
      transform: translateY(-4px) scale(1.008);
      background: var(--royal-card-bg-hover);
      box-shadow: 0 16px 30px rgba(0, 0, 0, 0.7), 0 0 25px var(--royal-glow);
    }

    .royal-match-card.is-revealed {
      border-color: var(--royal-border);
      background: var(--royal-card-bg-active);
      box-shadow: 0 0 28px var(--royal-glow), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .royal-teams-row {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      justify-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    @media (min-width: 640px) {
      .royal-teams-row {
        gap: 16px;
      }
    }

    /* Individual Team Glowing & Enlarging Hover Interaction */
    .royal-team {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: transform;
    }

    .royal-team:hover {
      transform: scale(1.18) translateY(-4px);
    }

    .royal-logo-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 2px solid var(--royal-border);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
      flex-shrink: 0;
    }

    @media (min-width: 640px) {
      .royal-logo-wrapper {
        width: 64px;
        height: 64px;
      }
    }

    .royal-team-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .royal-team-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      max-width: 130px;
      line-height: 1.35;
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    @media (min-width: 640px) {
      .royal-team-name {
        font-size: 14px;
        max-width: 160px;
        min-height: 36px;
      }
    }

    /* When cursor moves to team, it expands prominently with theme halo glow */
    .royal-team:hover .royal-logo-wrapper {
      border-color: var(--royal-accent);
      transform: scale(1.22);
      box-shadow: 0 0 35px 12px var(--royal-glow), 0 0 18px var(--royal-accent);
    }

    .royal-team:hover .royal-team-logo {
      transform: scale(1.12);
      filter: drop-shadow(0 0 12px var(--royal-glow));
    }

    .royal-team:hover .royal-team-name {
      transform: scale(1.08);
      color: var(--royal-accent);
      text-shadow: 0 0 12px var(--royal-glow);
    }

    .royal-center-meta {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 4px;
    }

    .royal-vs-badge {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 800;
      color: var(--royal-primary);
      border: 1px solid var(--royal-border);
      border-radius: 9999px;
      padding: 2px 12px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 0 6px var(--royal-glow);
      letter-spacing: 1px;
    }

    @media (min-width: 640px) {
      .royal-vs-badge {
        font-size: 11px;
      }
    }

    .royal-score-box {
      font-family: 'Orbitron', sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: var(--royal-primary);
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 2px 0;
      text-shadow: 0 0 12px var(--royal-glow);
    }

    @media (min-width: 640px) {
      .royal-score-box {
        font-size: 30px;
      }
    }

    .royal-score-sep { color: #ffffff; }

    .royal-date-time {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      white-space: nowrap;
      letter-spacing: 0.5px;
    }

    /* Win Probability Bar Indicator */
    .royal-meter-container {
      width: 100%;
      max-width: 280px;
      height: 6px;
      margin: 8px auto;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 9999px;
      display: flex;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    @media (min-width: 640px) {
      .royal-meter-container {
        max-width: 320px;
      }
    }

    .royal-meter-bar { height: 100%; }
    .royal-meter-home { background: linear-gradient(90deg, var(--royal-primary), var(--royal-accent)); border-radius: 9999px 0 0 9999px; }
    .royal-meter-away { background: rgba(71, 85, 105, 0.7); border-radius: 0 9999px 9999px 0; }

    /* 4-Grid Probability & Prediction Analytics with Neon Cyan numbers */
    .royal-stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    @media (min-width: 640px) {
      .royal-stats-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .royal-stat-box {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    }

    .royal-stat-label {
      font-family: 'Rajdhani', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #cbd5e1;
      text-transform: uppercase;
    }

    @media (min-width: 640px) {
      .royal-stat-label {
        font-size: 11px;
      }
    }

    .royal-stat-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 14px;
      font-weight: 900;
    }

    @media (min-width: 640px) {
      .royal-stat-value {
        font-size: 16px;
      }
    }

    .cyan-val {
      color: #22d3ee;
      text-shadow: 0 0 6px rgba(34, 211, 238, 0.7);
    }

    .gold-val {
      color: var(--royal-primary);
    }

    .royal-stat-sub {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (min-width: 640px) {
      .royal-stat-sub {
        font-size: 11px;
      }
    }

    .royal-detail-btn-wrap {
      padding-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .royal-detail-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 18px;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid var(--royal-border);
      color: var(--royal-primary);
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 0 10px var(--royal-glow);
      transition: all 0.25s ease;
    }

    .royal-match-card:hover .royal-detail-btn {
      transform: scale(1.06);
      border-color: var(--royal-accent);
      box-shadow: 0 0 15px var(--royal-glow);
    }

    .royal-close-detail-wrap {
      padding-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .royal-close-detail-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 14px;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      transition: all 0.2s ease;
    }

    /* REVEAL / LOCK TOGGLE MECHANISM */
    .royal-match-card .royal-revealed-elem { display: none; }
    .royal-match-card .royal-locked-elem { display: flex; }
    .royal-match-card.is-revealed .royal-revealed-elem { display: flex; animation: royalFadeIn 0.3s ease; }
    .royal-match-card.is-revealed .royal-stats-grid { display: grid; }
    .royal-match-card.is-revealed .royal-locked-elem { display: none; }
  </style>

  <div class="royal-content-container">
    <!-- 1. Royal Header Banner (With Brand Logo & Date) -->
    <div class="royal-header-card">
      <div class="royal-header-beam"></div>
      <div class="royal-header-inner">
        <div class="royal-header-logo-wrap">
          <img src="${siteLogoSource}" alt="${siteName}" class="royal-header-brand-img" loading="lazy" onerror="this.style.display='none'; document.getElementById('royal-header-fallback-title').style.display='block';" />
          <h1 id="royal-header-fallback-title" class="royal-header-title" style="display:none;">${siteName}</h1>
        </div>
        <p class="royal-header-subtitle">${headerDateText}</p>
      </div>
    </div>

    <!-- 2. Running Text Marquee -->
    <div class="royal-marquee-wrap">
      <div class="royal-marquee-inner">
        <span class="royal-marquee-text">
          <span>${keywordsText}</span>
          <span class="royal-marquee-star">✦</span>
          <span>${keywordsText}</span>
          <span class="royal-marquee-star">✦</span>
          <span>${keywordsText}</span>
          <span class="royal-marquee-star">✦</span>
          <span>${keywordsText}</span>
        </span>
      </div>
    </div>

    ${
      settings.showSpecialMatch && specialMatches.length > 0
        ? `<!-- 3. Pertandingan Spesial Carousel Slider with Wallpaper -->
    <div class="royal-special-section">
      <div class="royal-special-badge-header">
        <div class="royal-special-pill">
          <span>⭐</span>
          <span>${settings.specialMatchTitle || "PERTANDINGAN SPESIAL"}</span>
          <span>⭐</span>
        </div>
      </div>

      <div class="royal-special-card" style="background-image: linear-gradient(to bottom, rgba(6, 8, 13, 0.5), rgba(3, 4, 8, 0.75)), url('${wallpaper.imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop"}');">
        <div class="royal-stadium-spotlight"></div>
        
${specialSlidesHtml}

        <!-- Slider Controls with Soft Arrow Navigation -->
        <div class="royal-slider-controls">
          <button class="royal-slider-arrow" onclick="window.royalPrevSpecialSlide(event)" title="Pertandingan Sebelumnya">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div class="royal-indicator-wrap">
            <span class="royal-slide-count-text" id="royal-slide-indicator">1 / ${totalSpecialCount}</span>
          </div>

          <button class="royal-slider-arrow" onclick="window.royalNextSpecialSlide(event)" title="Pertandingan Selanjutnya">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>`
        : ""
    }

    <!-- 4. Filter Liga & Search Input -->
    <div class="royal-filter-row">
      <div class="royal-filter-col">
        <label class="royal-filter-label">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--royal-primary);">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
            <path d="M6 4h12v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V4z"></path>
          </svg>
          <span>PILIH LIGA</span>
        </label>
        <div class="royal-select-wrap">
          <select id="royal-league-select" class="royal-select" onchange="window.royalFilterLeague(this.value)">
            <option value="ALL">Semua Liga (${allMatches.length} Match)</option>
${leagueOptionsHtml}
          </select>
        </div>
      </div>
      <div class="royal-filter-col">
        <label class="royal-filter-label">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--royal-primary);">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>CARI TIM</span>
        </label>
        <div class="royal-input-wrap">
          <svg class="royal-input-search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="royal-search-input" class="royal-input" placeholder="Nama tim atau liga..." oninput="window.royalSearchTeams(this.value)" />
        </div>
      </div>
    </div>

    <!-- 5. Main Fixtures & Predictions List -->
    <div id="royal-matches-container">
${fixturesHtml}
    </div>
  </div>

  <!-- Interactive Client-Side Engine -->
  <script>
    (function() {
      var currentSlide = 0;
      var totalSlides = ${totalSpecialCount};

      window.royalToggleReveal = function(card) {
        if (!card) return;
        card.classList.toggle('is-revealed');
      };

      window.royalNextSpecialSlide = function(e) {
        if (e) e.stopPropagation();
        if (totalSlides <= 1) return;
        var widget = document.getElementById('royal-predictions-widget');
        if (!widget) return;
        var slides = widget.querySelectorAll('.royal-special-slide');
        if (!slides.length) return;
        slides[currentSlide].classList.remove('royal-special-slide-active');
        currentSlide = (currentSlide + 1) % totalSlides;
        slides[currentSlide].classList.add('royal-special-slide-active');
        updateIndicator(widget);
      };

      window.royalPrevSpecialSlide = function(e) {
        if (e) e.stopPropagation();
        if (totalSlides <= 1) return;
        var widget = document.getElementById('royal-predictions-widget');
        if (!widget) return;
        var slides = widget.querySelectorAll('.royal-special-slide');
        if (!slides.length) return;
        slides[currentSlide].classList.remove('royal-special-slide-active');
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        slides[currentSlide].classList.add('royal-special-slide-active');
        updateIndicator(widget);
      };

      function updateIndicator(widget) {
        var ind = widget.querySelector('#royal-slide-indicator');
        if (ind) ind.innerText = (currentSlide + 1) + ' / ' + totalSlides;
      }

      window.royalFilterLeague = function(selectedLeague) {
        var widget = document.getElementById('royal-predictions-widget');
        if (!widget) return;
        var groups = widget.querySelectorAll('.royal-league-group');
        groups.forEach(function(grp) {
          var name = grp.getAttribute('data-league-name');
          if (selectedLeague === 'ALL' || name === selectedLeague) {
            grp.style.display = 'flex';
          } else {
            grp.style.display = 'none';
          }
        });
      };

      window.royalSearchTeams = function(query) {
        var widget = document.getElementById('royal-predictions-widget');
        if (!widget) return;
        var q = (query || '').toLowerCase().trim();
        var cards = widget.querySelectorAll('.royal-match-card');
        var groups = widget.querySelectorAll('.royal-league-group');

        cards.forEach(function(card) {
          var searchTxt = (card.getAttribute('data-search') || '').toLowerCase();
          if (!q || searchTxt.indexOf(q) !== -1) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });

        // Hide empty groups
        groups.forEach(function(grp) {
          var visibleCards = grp.querySelectorAll('.royal-match-card:not([style*="display: none"])');
          if (visibleCards.length === 0) {
            grp.style.display = 'none';
          } else {
            grp.style.display = 'flex';
          }
        });
      };
    })();
  </script>
</div>
<!-- End Football Predictions Widget -->`;
}
