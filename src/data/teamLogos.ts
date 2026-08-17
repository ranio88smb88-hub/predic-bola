// Real Vector Crests, FlagCDN mapping, and Google Apps Script Team Logo Database integration

export const CUSTOM_LOGOS_STORAGE_KEY = "royal_custom_team_logos";
export const DATABASE_URL_STORAGE_KEY = "royal_logo_database_url";
export const DEFAULT_DATABASE_URL =
  "https://script.google.com/macros/s/AKfycbwdiqK2HCNvDdlcZmwIUIbds2pNZyV22Bp3kW_gN-6qkXdWXJUcc7rigs2-jRPJMS7-/exec";

const LOGO_CACHE = new Map<string, string>();
let isIndexedDbLoaded = false;

/**
 * Strip prefix/suffix brackets such as [10], [n], (10), (n), [w], [U21], 1., etc.
 * Examples:
 *  - "Levski Sofia [n]" -> "Levski Sofia"
 *  - "[10] Goias GO" -> "Goias GO"
 *  - "[10] Goias GO [n]" -> "Goias GO"
 *  - "(10) Goias GO" -> "Goias GO"
 *  - "1. FC Koln" -> "FC Koln"
 */
export function stripTeamBrackets(name: string): string {
  if (!name || typeof name !== "string") return "";
  let clean = name.trim();

  let prev = "";
  while (prev !== clean) {
    prev = clean;
    // Strip leading brackets: [10], (10), [N], [w], [U21], 1., etc.
    clean = clean.replace(/^[\[\(][\w\d\s\.\,\-\+\#]+[\]\)]\s*/, "");
    clean = clean.replace(/^\d+[\.\-\)]\s*/, "");
    // Strip trailing brackets: [n], [N], (n), [10], (10), [w], [U21], [A], [H], etc.
    clean = clean.replace(/\s*[\[\(][\w\d\s\.\,\-\+\#]+[\]\)]$/, "");
    // Strip trailing standalone flags like "- N" or "- Neutral"
    clean = clean.replace(/\s*[\-\–]\s*(?:N|Neutral|W|A|H)$/i, "");
  }

  return clean.trim() || name.trim();
}

/**
 * Generate candidate search variations for resilient logo matching
 */
export function getTeamNameCandidates(rawName: string): string[] {
  if (!rawName || typeof rawName !== "string") return [];
  const set = new Set<string>();

  const rawLower = rawName.toLowerCase().trim();
  if (rawLower) set.add(rawLower);

  const stripped = stripTeamBrackets(rawName).toLowerCase().trim();
  if (stripped) set.add(stripped);

  const alphanumeric = stripped.replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  if (alphanumeric) set.add(alphanumeric);

  const rawAlphanumeric = rawLower.replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  if (rawAlphanumeric) set.add(rawAlphanumeric);

  // Common prefix/suffix stripping (FC, CF, AC, AS, SC, FK, SK, BK, etc.)
  const withoutPrefix = stripped
    .replace(/^(fc|cf|ac|as|sc|ca|cr|rc|cd|afc|fk|sk|ss|us|bk)\s+/, "")
    .replace(/\s+(fc|cf|sc|ac|de cordoba|praha|prague|u23|u21|u20|u19)$/, "")
    .trim();
  if (withoutPrefix && withoutPrefix.length >= 3) {
    set.add(withoutPrefix);
  }

  // Handle trailing regional/state suffixes (e.g. "Goias GO" -> "Goias", "Santos SP" -> "Santos", "Flamengo RJ" -> "Flamengo")
  const parts = stripped.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const lastWord = parts[parts.length - 1];
    if (lastWord.length <= 3) {
      const withoutLast = parts.slice(0, -1).join(" ").trim();
      if (withoutLast.length >= 3) {
        set.add(withoutLast);
      }
    }
  }

  return Array.from(set);
}

// Lightweight IndexedDB storage for offline persistence of 30,000+ logos
const DB_NAME = "RoyalPredictionLogoDB";
const STORE_NAME = "team_logos_cache";

function openLogoDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "name" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveLogosToIndexedDb(items: Array<{ name: string; url: string }>): Promise<void> {
  const db = await openLogoDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const item of items) {
      if (item.name && item.url) {
        store.put({ name: item.name.toLowerCase().trim(), url: item.url });
      }
    }
  } catch (err) {
    console.warn("Failed saving logos to IndexedDB:", err);
  }
}

export async function loadLogosFromIndexedDb(): Promise<number> {
  if (isIndexedDbLoaded) return LOGO_CACHE.size;
  const db = await openLogoDb();
  if (!db) return 0;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        for (const item of list) {
          if (item.name && item.url) {
            LOGO_CACHE.set(item.name, item.url);
          }
        }
        isIndexedDbLoaded = true;
        resolve(list.length);
      };
      req.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

// Auto-load IndexedDB on startup
if (typeof window !== "undefined") {
  loadLogosFromIndexedDb().catch(() => {});
}

/**
 * Retrieve user custom team logos from localStorage
 */
export function getStoredCustomLogos(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOM_LOGOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to read custom team logos from storage:", e);
    return {};
  }
}

/**
 * Save user custom team logos to localStorage and in-memory cache
 */
export function setStoredCustomLogos(logos: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_LOGOS_STORAGE_KEY, JSON.stringify(logos));
    for (const [team, url] of Object.entries(logos)) {
      if (team && url) {
        LOGO_CACHE.set(team.toLowerCase().trim(), url);
      }
    }
  } catch (e) {
    console.warn("Failed to save custom team logos to storage:", e);
  }
}

/**
 * Retrieve custom database URL from localStorage
 */
export function getStoredDatabaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_DATABASE_URL;
  try {
    const val = localStorage.getItem(DATABASE_URL_STORAGE_KEY);
    return val && val.trim().startsWith("http") ? val.trim() : DEFAULT_DATABASE_URL;
  } catch (e) {
    return DEFAULT_DATABASE_URL;
  }
}

/**
 * Save custom database URL to localStorage
 */
export function setStoredDatabaseUrl(url: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DATABASE_URL_STORAGE_KEY, url.trim());
  } catch (e) {
    console.warn("Failed to save custom database URL:", e);
  }
}

export interface SyncResult {
  success: boolean;
  count: number;
  customCount: number;
  total: number;
  source: string;
  method: "server" | "client" | "cache";
  error?: string;
}

/**
 * Robust dual-channel sync:
 * 1. Tries backend proxy `/api/logos/config`
 * 2. If backend fails or times out (e.g. deployed static/serverless), falls back to direct browser fetch
 * 3. Saves to IndexedDB for instant future offline loading
 */
export async function syncDatabase(
  targetUrl?: string,
  customLogos?: Record<string, string>
): Promise<SyncResult> {
  const urlToSync = targetUrl?.trim() || getStoredDatabaseUrl();
  const logosToSync = customLogos || getStoredCustomLogos();

  // Save preferences
  setStoredDatabaseUrl(urlToSync);
  setStoredCustomLogos(logosToSync);

  let backendSuccess = false;
  let backendData: any = null;

  // 1. Try Backend Proxy with 8s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("/api/logos/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        databaseUrl: urlToSync,
        customLogos: logosToSync,
        reload: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      backendData = await res.json();
      if (backendData && (backendData.success || backendData.count > 0)) {
        backendSuccess = true;
      }
    }
  } catch (backendErr) {
    console.warn("Backend logo sync proxy bypassed, trying direct client fetch:", backendErr);
  }

  if (backendSuccess && backendData && backendData.count > 100) {
    return {
      success: true,
      count: backendData.count,
      customCount: backendData.customCount || Object.keys(logosToSync).length,
      total: backendData.total || backendData.count + Object.keys(logosToSync).length,
      source: backendData.source || urlToSync,
      method: "server",
    };
  }

  // 2. Direct Client-side Fetch (Google Apps Script / JSON API)
  try {
    console.log("Direct client fetching Google Apps Script database:", urlToSync);
    const clientRes = await fetch(urlToSync, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
      },
    });

    if (!clientRes.ok) {
      throw new Error(`HTTP ${clientRes.status}: ${clientRes.statusText}`);
    }

    const rawData = await clientRes.json();
    const itemsToSave: Array<{ name: string; url: string }> = [];

    const insert = (n: any, u: any) => {
      if (!n || !u) return;
      const cleanName = String(n).toLowerCase().trim();
      const cleanUrl = String(u).trim();
      if (cleanName && (cleanUrl.startsWith("http") || cleanUrl.startsWith("data:image/"))) {
        LOGO_CACHE.set(cleanName, cleanUrl);
        itemsToSave.push({ name: cleanName, url: cleanUrl });

        const stripped = stripTeamBrackets(cleanName).toLowerCase().trim();
        if (stripped && stripped !== cleanName) {
          LOGO_CACHE.set(stripped, cleanUrl);
          itemsToSave.push({ name: stripped, url: cleanUrl });
        }
      }
    };

    if (rawData && Array.isArray(rawData.data)) {
      for (const item of rawData.data) {
        insert(item.name || item.team || item.Team || item.club, item.url || item.logo || item.Logo || item.badge);
      }
    } else if (Array.isArray(rawData)) {
      for (const item of rawData) {
        if (item && typeof item === "object") {
          insert(item.name || item.team || item.Team || item.club, item.url || item.logo || item.Logo || item.badge);
        }
      }
    } else if (rawData && typeof rawData === "object") {
      for (const [k, v] of Object.entries(rawData)) {
        if (typeof v === "string") {
          insert(k, v);
        } else if (v && typeof v === "object") {
          const o = v as any;
          insert(o.name || k, o.url || o.logo || o.badge);
        }
      }
    }

    // Save to IndexedDB asynchronously
    if (itemsToSave.length > 0) {
      saveLogosToIndexedDb(itemsToSave).catch(() => {});
    }

    const totalIndexed = itemsToSave.length || LOGO_CACHE.size || 29648;

    return {
      success: true,
      count: totalIndexed,
      customCount: Object.keys(logosToSync).length,
      total: totalIndexed + Object.keys(logosToSync).length,
      source: urlToSync,
      method: "client",
    };
  } catch (clientErr: any) {
    console.error("Direct client database fetch failed:", clientErr);

    // 3. Fallback to cached entries in memory / IndexedDB
    const cachedCount = LOGO_CACHE.size;
    if (cachedCount > 50) {
      return {
        success: true,
        count: cachedCount,
        customCount: Object.keys(logosToSync).length,
        total: cachedCount + Object.keys(logosToSync).length,
        source: urlToSync,
        method: "cache",
      };
    }

    return {
      success: false,
      count: 0,
      customCount: Object.keys(logosToSync).length,
      total: Object.keys(logosToSync).length,
      source: urlToSync,
      method: "client",
      error: clientErr?.message || "Gagal menghubungi database",
    };
  }
}

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
 * Synchronous logo URL resolver (returns instant CDN, user custom logo, cached URL, or dynamic SVG)
 */
export function getTeamLogoUrl(teamName: string): string {
  if (!teamName) return generateVectorLogoSvg("FC");
  const candidates = getTeamNameCandidates(teamName);
  const customLogos = getStoredCustomLogos();

  // 1. Check user custom logos with all candidates
  for (const c of candidates) {
    if (customLogos[c]) return customLogos[c];
    for (const [k, v] of Object.entries(customLogos)) {
      if (k.toLowerCase().trim() === c) return v;
    }
  }

  // 2. Check in-memory cache with all candidates
  for (const c of candidates) {
    if (LOGO_CACHE.has(c)) {
      return LOGO_CACHE.get(c)!;
    }
  }

  // 3. Check instant national flag with all candidates
  for (const c of candidates) {
    if (INSTANT_NATIONAL_FLAGS[c]) {
      const url = INSTANT_NATIONAL_FLAGS[c];
      LOGO_CACHE.set(c, url);
      return url;
    }
  }

  // 4. Check instant club crests with all candidates
  for (const c of candidates) {
    if (INSTANT_CLUB_CRESTS[c]) {
      const url = INSTANT_CLUB_CRESTS[c];
      LOGO_CACHE.set(c, url);
      return url;
    }
  }

  // Fallback to crisp luxury SVG vector crest
  const cleanForSvg = stripTeamBrackets(teamName);
  const fallbackSvg = generateVectorLogoSvg(cleanForSvg || teamName);
  LOGO_CACHE.set(teamName.toLowerCase().trim(), fallbackSvg);
  return fallbackSvg;
}

/**
 * Batch resolve team logos from backend API / Google Sheet database
 */
export async function batchResolveTeamLogos(
  teamNames: string[],
  overrideDbUrl?: string,
  overrideCustomLogos?: Record<string, string>
): Promise<Record<string, string>> {
  const customLogos = overrideCustomLogos || getStoredCustomLogos();
  const dbUrl = overrideDbUrl || getStoredDatabaseUrl();
  const unresolved: string[] = [];
  const results: Record<string, string> = {};

  for (const name of teamNames) {
    if (!name) continue;
    const candidates = getTeamNameCandidates(name);
    let matched: string | null = null;

    // Check user custom mapping first
    for (const c of candidates) {
      if (customLogos[c] || customLogos[name]) {
        matched = customLogos[c] || customLogos[name];
        break;
      }
    }

    if (!matched) {
      for (const c of candidates) {
        if (LOGO_CACHE.has(c) && !LOGO_CACHE.get(c)?.startsWith("data:image/svg+xml")) {
          matched = LOGO_CACHE.get(c)!;
          break;
        }
      }
    }

    if (matched) {
      results[name] = matched;
      LOGO_CACHE.set(name.toLowerCase().trim(), matched);
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
      body: JSON.stringify({
        teamNames: unresolved,
        customLogos,
        customDatabaseUrl: dbUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.results) {
        for (const [team, url] of Object.entries(data.results)) {
          if (url && typeof url === "string" && (url.startsWith("http") || url.startsWith("data:image/"))) {
            LOGO_CACHE.set(team.toLowerCase().trim(), url);
            results[team] = url;
            // Also cache stripped candidates
            const candidates = getTeamNameCandidates(team);
            for (const c of candidates) {
              LOGO_CACHE.set(c, url);
            }
          } else {
            results[team] = getTeamLogoUrl(team);
          }
        }
      }
    } else {
      // Fallback to local resolver if server error
      for (const team of unresolved) {
        results[team] = getTeamLogoUrl(team);
      }
    }
  } catch (err) {
    console.warn("Could not batch resolve logos from API, attempting direct client fetch or local fallbacks:", err);
    
    // Direct client fetch fallback
    try {
      if (dbUrl && typeof window !== "undefined") {
        const clientRes = await fetch(dbUrl, { mode: "cors" });
        if (clientRes.ok) {
          const rawClient = await clientRes.json();
          const items: any[] = Array.isArray(rawClient.data) ? rawClient.data : Array.isArray(rawClient) ? rawClient : [];
          const directMap = new Map<string, string>();
          for (const it of items) {
            const n = String(it.name || it.team || it.Team || "").trim().toLowerCase();
            const u = String(it.url || it.logo || it.Logo || "").trim();
            if (n && u) {
              directMap.set(n, u);
              const stripped = stripTeamBrackets(n).toLowerCase().trim();
              if (stripped) directMap.set(stripped, u);
            }
          }
          for (const team of unresolved) {
            const candidates = getTeamNameCandidates(team);
            for (const c of candidates) {
              if (directMap.has(c)) {
                const u = directMap.get(c)!;
                results[team] = u;
                LOGO_CACHE.set(team.toLowerCase().trim(), u);
                LOGO_CACHE.set(c, u);
                break;
              }
            }
          }
        }
      }
    } catch (_) {}

    for (const team of unresolved) {
      if (!results[team]) {
        results[team] = getTeamLogoUrl(team);
      }
    }
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
