// Real Vector Crests, FlagCDN mapping, and Google Apps Script Team Logo Database integration

const LOGO_CACHE = new Map<string, string>();

// Preloaded known national flags and high-profile teams for instant synchronous rendering
export const INSTANT_NATIONAL_FLAGS: Record<string, string> = {
  "philippines": "https://flagcdn.com/w320/ph.png",
  "myanmar": "https://flagcdn.com/w320/mm.png",
  "malaysia": "https://flagcdn.com/w320/my.png",
  "laos": "https://flagcdn.com/w320/la.png",
  "indonesia": "https://flagcdn.com/w320/id.png",
  "thailand": "https://flagcdn.com/w320/th.png",
  "vietnam": "https://flagcdn.com/w320/vn.png",
  "singapore": "https://flagcdn.com/w320/sg.png",
  "cambodia": "https://flagcdn.com/w320/kh.png",
  "japan": "https://flagcdn.com/w320/jp.png",
  "south korea": "https://flagcdn.com/w320/kr.png",
  "australia": "https://flagcdn.com/w320/au.png",
  "argentina": "https://flagcdn.com/w320/ar.png",
  "brazil": "https://flagcdn.com/w320/br.png",
  "england": "https://flagcdn.com/w320/gb-eng.png",
  "spain": "https://flagcdn.com/w320/es.png",
  "germany": "https://flagcdn.com/w320/de.png",
  "france": "https://flagcdn.com/w320/fr.png",
  "italy": "https://flagcdn.com/w320/it.png",
  "netherlands": "https://flagcdn.com/w320/nl.png",
  "portugal": "https://flagcdn.com/w320/pt.png",
};

// Common direct CDN badges
export const INSTANT_CLUB_CRESTS: Record<string, string> = {
  "sparta prague": "https://r2.thesportsdb.com/images/media/team/badge/j00qct1718287150.png",
  "ac sparta praha": "https://r2.thesportsdb.com/images/media/team/badge/j00qct1718287150.png",
  "shamrock rovers": "https://r2.thesportsdb.com/images/media/team/badge/u1zowj1491504381.png",
  "flamengo": "https://r2.thesportsdb.com/images/media/team/badge/syptwx1473538074.png",
  "cr flamengo": "https://r2.thesportsdb.com/images/media/team/badge/syptwx1473538074.png",
  "bolivar": "https://r2.thesportsdb.com/images/media/team/badge/0o5jrz1579798499.png",
  "club bolivar": "https://r2.thesportsdb.com/images/media/team/badge/0o5jrz1579798499.png",
  "river plate": "https://r2.thesportsdb.com/images/media/team/badge/03dmi31645539717.png",
  "ca river plate": "https://r2.thesportsdb.com/images/media/team/badge/03dmi31645539717.png",
  "talleres": "https://r2.thesportsdb.com/images/media/team/badge/7hum2t1769310938.png",
  "talleres de cordoba": "https://r2.thesportsdb.com/images/media/team/badge/7hum2t1769310938.png",
  "real madrid": "https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png",
  "manchester city": "https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png",
  "man city": "https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png",
  "arsenal": "https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png",
  "bayern munich": "https://r2.thesportsdb.com/images/media/team/badge/m5w6271612467000.png",
  "barcelona": "https://r2.thesportsdb.com/images/media/team/badge/wq9sir1639406443.png",
  "liverpool": "https://r2.thesportsdb.com/images/media/team/badge/c8945n1612467048.png",
  "manchester united": "https://r2.thesportsdb.com/images/media/team/badge/xzqdr11612467018.png",
  "chelsea": "https://r2.thesportsdb.com/images/media/team/badge/yvwvtu1448813215.png",
  "juventus": "https://r2.thesportsdb.com/images/media/team/badge/rytuqq1473502987.png",
  "inter milan": "https://r2.thesportsdb.com/images/media/team/badge/wwpruw1473502978.png",
  "ac milan": "https://r2.thesportsdb.com/images/media/team/badge/wutxpp1473502958.png",
  "paris saint-germain": "https://r2.thesportsdb.com/images/media/team/badge/8d7oel1612467069.png",
  "psg": "https://r2.thesportsdb.com/images/media/team/badge/8d7oel1612467069.png",
  "persib": "https://r2.thesportsdb.com/images/media/team/badge/pbd1231612467.png",
  "persija": "https://r2.thesportsdb.com/images/media/team/badge/psj1231612467.png",
  "fenerbahce": "https://r2.thesportsdb.com/images/media/team/badge/twxxvs1448199691.png",
  "lugano": "https://r2.thesportsdb.com/images/media/team/badge/2kh2if1567615581.png",
};

/**
 * Synchronous logo URL resolver (returns instant CDN, cached URL, or dynamic SVG)
 */
export function getTeamLogoUrl(teamName: string): string {
  if (!teamName) return generateVectorLogoSvg("FC");
  const normalized = teamName.toLowerCase().trim();

  // Check in-memory cache
  if (LOGO_CACHE.has(normalized)) {
    return LOGO_CACHE.get(normalized)!;
  }

  // Check instant national flag
  if (INSTANT_NATIONAL_FLAGS[normalized]) {
    const url = INSTANT_NATIONAL_FLAGS[normalized];
    LOGO_CACHE.set(normalized, url);
    return url;
  }

  // Check instant club crests
  if (INSTANT_CLUB_CRESTS[normalized]) {
    const url = INSTANT_CLUB_CRESTS[normalized];
    LOGO_CACHE.set(normalized, url);
    return url;
  }

  // Fallback to crisp luxury SVG vector crest
  const fallbackSvg = generateVectorLogoSvg(teamName);
  LOGO_CACHE.set(normalized, fallbackSvg);
  return fallbackSvg;
}

/**
 * Batch resolve team logos from backend API / Google Sheet database
 */
export async function batchResolveTeamLogos(teamNames: string[]): Promise<Record<string, string>> {
  const unresolved: string[] = [];
  const results: Record<string, string> = {};

  for (const name of teamNames) {
    if (!name) continue;
    const clean = name.toLowerCase().trim();
    if (LOGO_CACHE.has(clean) && !LOGO_CACHE.get(clean)?.startsWith("data:image/svg+xml")) {
      results[name] = LOGO_CACHE.get(clean)!;
    } else {
      unresolved.push(name);
    }
  }

  if (unresolved.length === 0) {
    return results;
  }

  try {
    const res = await fetch("/api/logos/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamNames: unresolved }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.results) {
        for (const [team, url] of Object.entries(data.results)) {
          if (url && typeof url === "string" && url.startsWith("http")) {
            LOGO_CACHE.set(team.toLowerCase().trim(), url);
            results[team] = url;
          } else {
            results[team] = getTeamLogoUrl(team);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not batch resolve logos from API, using cached & local fallbacks:", err);
  }

  return results;
}

/**
 * Generate a luxury vector crest badge SVG as data URI for any football team
 */
export function generateVectorLogoSvg(teamName: string): string {
  const cleanName = teamName.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  let initials = "FC";

  if (words.length === 1) {
    initials = words[0].slice(0, 3).toUpperCase();
  } else if (words.length === 2) {
    initials = (words[0][0] + words[1].slice(0, 2)).toUpperCase();
  } else if (words.length >= 3) {
    initials = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }

  // Hash-based color selection
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palettes = [
    { bg: "#1e3a8a", text: "#ffffff", accent: "#fbbf24" },
    { bg: "#991b1b", text: "#ffffff", accent: "#fde047" },
    { bg: "#065f46", text: "#ffffff", accent: "#34d399" },
    { bg: "#581c87", text: "#ffffff", accent: "#e9d5ff" },
    { bg: "#1f2937", text: "#f97316", accent: "#fed7aa" },
    { bg: "#0369a1", text: "#ffffff", accent: "#7dd3fc" },
    { bg: "#701a75", text: "#ffffff", accent: "#f472b6" },
  ];

  const choice = palettes[Math.abs(hash) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110" width="100" height="110">
    <defs>
      <linearGradient id="shield_grad_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${choice.bg}"/>
        <stop offset="100%" stop-color="#070a10"/>
      </linearGradient>
      <linearGradient id="border_grad_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${choice.accent}"/>
        <stop offset="50%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="${choice.accent}"/>
      </linearGradient>
    </defs>
    <path d="M 10 16 C 30 14, 70 14, 90 16 C 90 62, 50 96, 50 102 C 50 96, 10 62, 10 16 Z" fill="url(#shield_grad_${initials})" stroke="url(#border_grad_${initials})" stroke-width="3.5"/>
    <path d="M 16 22 C 34 20, 66 20, 84 22 C 84 58, 50 88, 50 92 C 50 88, 16 58, 16 22 Z" fill="none" stroke="${choice.accent}" stroke-width="1" opacity="0.5"/>
    <text x="50" y="55" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${initials.length > 3 ? '18' : '22'}" fill="${choice.text}" text-anchor="middle" dominant-baseline="central" letter-spacing="1" stroke="#000" stroke-width="0.5">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
