import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const DEFAULT_GOOGLE_SHEETS_LOGO_API =
  "https://script.google.com/macros/s/AKfycbwdiqK2HCNvDdlcZmwIUIbds2pNZyV22Bp3kW_gN-6qkXdWXJUcc7rigs2-jRPJMS7-/exec";

let currentDatabaseUrl = process.env.LOGO_DATABASE_URL || DEFAULT_GOOGLE_SHEETS_LOGO_API;

// In-memory team logos cache & index
let teamLogosMap = new Map<string, string>();
let customUserLogosMap = new Map<string, string>();
let teamLogosList: Array<{ name: string; url: string }> = [];
let isLogoDatabaseLoaded = false;
let isLogoDatabaseLoading = false;
let loadPromise: Promise<void> | null = null;

// Preload known national and major club aliases
const POPULAR_ALIASES: Record<string, string[]> = {
  "philippines": ["filipina", "pilipinas", "philippines national team", "azkals"],
  "myanmar": ["burma", "myanmar national team", "chinthe"],
  "indonesia": ["timnas indonesia", "garuda", "indonesia national team"],
  "malaysia": ["harimau malaya", "malaysia national team"],
  "laos": ["laos national team", "lao"],
  "vietnam": ["vietnam national team", "golden star warriors"],
  "thailand": ["thailand national team", "war elephants"],
  "singapore": ["singapore national team", "the lions"],
  "cambodia": ["cambodia national team", "angkor warriors"],
  "sparta prague": ["ac sparta praha", "sparta praha", "sparta"],
  "shamrock rovers": ["shamrock rovers fc", "shamrock"],
  "flamengo": ["cr flamengo", "flamengo rj"],
  "bolivar": ["club bolivar", "bolívar"],
  "river plate": ["ca river plate", "river"],
  "talleres": ["talleres de cordoba", "ca talleres de córdoba"],
  "real madrid": ["real madrid cf", "el real"],
  "manchester city": ["man city", "mancity", "mc"],
  "manchester united": ["man utd", "manchester utd", "mu"],
  "bayern munich": ["fc bayern munchen", "bayern munchen", "bayern"],
  "paris saint-germain": ["psg", "paris sg"],
  "barcelona": ["fc barcelona", "barca"],
  "arsenal": ["arsenal fc", "the gunners"],
  "liverpool": ["liverpool fc", "the reds"],
  "chelsea": ["chelsea fc", "the blues"],
  "juventus": ["juve", "juventus fc"],
  "ac milan": ["milan", "rossoneri"],
  "inter milan": ["internazionale", "inter"],
  "borussia dortmund": ["dortmund", "bvb"],
  "atletico madrid": ["atletico", "atlético madrid"],
};

async function loadTeamLogosDatabase(targetUrl?: string, forceReload: boolean = false) {
  if (targetUrl) {
    if (targetUrl !== currentDatabaseUrl) {
      currentDatabaseUrl = targetUrl;
      forceReload = true;
    }
  }
  if (!forceReload && isLogoDatabaseLoaded && teamLogosMap.size > 100) {
    return;
  }
  if (isLogoDatabaseLoading && loadPromise && !forceReload) {
    return loadPromise;
  }

  isLogoDatabaseLoading = true;
  console.log(`Fetching team logos from database URL: ${currentDatabaseUrl}...`);

  loadPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    try {
      const res = await fetch(currentDatabaseUrl, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json, text/plain, */*",
          "User-Agent": "Mozilla/5.0 (compatible; RoyalPredictionApp/1.0)",
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }

      const rawData = await res.json();
      const newMap = new Map<string, string>();
      const list: Array<{ name: string; url: string }> = [];

      // Helper to insert item
      const insertItem = (name: any, url: any) => {
        if (!name || !url) return;
        const rawName = String(name).trim();
        const cleanName = rawName.toLowerCase();
        const logoUrl = String(url).trim();
        if (cleanName.length > 0 && (logoUrl.startsWith("http") || logoUrl.startsWith("data:image/"))) {
          newMap.set(cleanName, logoUrl);
          list.push({ name: rawName, url: logoUrl });
        }
      };

      // Support various JSON payload formats
      if (rawData && Array.isArray(rawData.data)) {
        for (const item of rawData.data) {
          insertItem(item.name || item.team || item.Team || item.club, item.url || item.logo || item.Logo || item.badge);
        }
      } else if (Array.isArray(rawData)) {
        for (const item of rawData) {
          if (typeof item === "object" && item !== null) {
            insertItem(item.name || item.team || item.Team || item.club, item.url || item.logo || item.Logo || item.badge);
          }
        }
      } else if (rawData && typeof rawData === "object") {
        for (const [k, v] of Object.entries(rawData)) {
          if (typeof v === "string") {
            insertItem(k, v);
          } else if (typeof v === "object" && v !== null) {
            const valObj = v as any;
            insertItem(valObj.name || k, valObj.url || valObj.logo || valObj.badge);
          }
        }
      }

      // Add popular aliases
      for (const [canonical, aliases] of Object.entries(POPULAR_ALIASES)) {
        const canonicalUrl = newMap.get(canonical);
        if (canonicalUrl) {
          for (const alias of aliases) {
            if (!newMap.has(alias)) {
              newMap.set(alias, canonicalUrl);
            }
          }
        }
      }

      if (newMap.size > 0) {
        teamLogosMap = newMap;
        teamLogosList = list;
        isLogoDatabaseLoaded = true;
        console.log(`Successfully indexed ${newMap.size} team logos from database.`);
      }
    } catch (err) {
      console.error("Error loading team logos database:", err);
    } finally {
      clearTimeout(timeoutId);
      isLogoDatabaseLoading = false;
    }
  })();

  return loadPromise;
}

// Initial async load
loadTeamLogosDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Initialize Gemini AI client lazily
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      logosLoaded: isLogoDatabaseLoaded,
      totalLogos: teamLogosMap.size + customUserLogosMap.size,
      databaseUrl: currentDatabaseUrl,
    });
  });

  // Logos Status and Reload endpoint
  app.get("/api/logos/status", (req, res) => {
    res.json({
      loaded: isLogoDatabaseLoaded,
      loading: isLogoDatabaseLoading,
      count: teamLogosMap.size,
      customCount: customUserLogosMap.size,
      total: teamLogosMap.size + customUserLogosMap.size,
      source: currentDatabaseUrl,
    });
  });

  // Configuration endpoint (sets custom database URL and/or custom logo mappings)
  app.post("/api/logos/config", async (req, res) => {
    const { databaseUrl, customLogos, reload } = req.body;

    if (customLogos && typeof customLogos === "object") {
      for (const [team, url] of Object.entries(customLogos)) {
        if (typeof team === "string" && typeof url === "string") {
          const cleanName = team.trim().toLowerCase();
          const cleanUrl = url.trim();
          if (cleanName && cleanUrl) {
            customUserLogosMap.set(cleanName, cleanUrl);
          }
        }
      }
    }

    if (databaseUrl && typeof databaseUrl === "string" && databaseUrl.trim().startsWith("http")) {
      currentDatabaseUrl = databaseUrl.trim();
      if (reload !== false) {
        await loadTeamLogosDatabase(currentDatabaseUrl);
      }
    } else if (reload === true) {
      await loadTeamLogosDatabase();
    }

    res.json({
      success: true,
      count: teamLogosMap.size,
      customCount: customUserLogosMap.size,
      total: teamLogosMap.size + customUserLogosMap.size,
      source: currentDatabaseUrl,
    });
  });

  app.post("/api/logos/reload", async (req, res) => {
    const { databaseUrl } = req.body || {};
    if (databaseUrl && typeof databaseUrl === "string" && databaseUrl.trim().startsWith("http")) {
      currentDatabaseUrl = databaseUrl.trim();
    }
    await loadTeamLogosDatabase(currentDatabaseUrl);
    res.json({
      success: true,
      count: teamLogosMap.size,
      customCount: customUserLogosMap.size,
      total: teamLogosMap.size + customUserLogosMap.size,
      source: currentDatabaseUrl,
    });
  });

  // Logos Batch Resolver Endpoint
  app.post("/api/logos/resolve", async (req, res) => {
    const { teamNames, customLogos, customDatabaseUrl } = req.body;
    if (!Array.isArray(teamNames)) {
      return res.status(400).json({ error: "teamNames must be an array" });
    }

    // Ingest on-the-fly custom logos if sent in request
    if (customLogos && typeof customLogos === "object") {
      for (const [team, url] of Object.entries(customLogos)) {
        if (typeof team === "string" && typeof url === "string") {
          const cleanName = team.trim().toLowerCase();
          const cleanUrl = url.trim();
          if (cleanName && cleanUrl) {
            customUserLogosMap.set(cleanName, cleanUrl);
          }
        }
      }
    }

    // If custom database URL requested and different from current, trigger fetch
    if (customDatabaseUrl && customDatabaseUrl !== currentDatabaseUrl && customDatabaseUrl.startsWith("http")) {
      await loadTeamLogosDatabase(customDatabaseUrl);
    } else if (isLogoDatabaseLoading && loadPromise) {
      // If database is still loading on initial boot, wait up to 4s
      try {
        await Promise.race([
          loadPromise,
          new Promise((resolve) => setTimeout(resolve, 4000)),
        ]);
      } catch (e) {
        console.warn("Timed out waiting for initial logo database load:", e);
      }
    }

    const results: Record<string, string | null> = {};

    for (const rawName of teamNames) {
      if (typeof rawName !== "string") continue;
      const clean = rawName.trim().toLowerCase();
      const stripped = clean.replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

      // 1. Highest priority: User's custom inputted logos
      let matchedUrl = customUserLogosMap.get(clean) || customUserLogosMap.get(stripped);

      // 2. Database exact & stripped match
      if (!matchedUrl) {
        matchedUrl = teamLogosMap.get(clean) || teamLogosMap.get(stripped);
      }

      // 3. Prefix and suffix normalization
      if (!matchedUrl) {
        const withoutPrefix = clean
          .replace(/^(fc|cf|ac|as|sc|ca|cr|rc|cd|afc|fk|sk|ss|us|bk)\s+/, "")
          .replace(/\s+(fc|cf|sc|ac|de cordoba|praha|prague|u23|u21|u20|u19)$/, "")
          .trim();

        if (withoutPrefix) {
          matchedUrl =
            customUserLogosMap.get(withoutPrefix) ||
            teamLogosMap.get(withoutPrefix);
        }
      }

      results[rawName] = matchedUrl || null;
    }

    res.json({ success: true, results });
  });

  // Logos Search endpoint for autocomplete
  app.get("/api/logos/search", (req, res) => {
    const query = String(req.query.q || "").toLowerCase().trim();
    const customList = Array.from(customUserLogosMap.entries()).map(([name, url]) => ({
      name: name.toUpperCase(),
      url,
      isCustom: true,
    }));

    if (!query) {
      return res.json({ results: [...customList, ...teamLogosList.slice(0, 30)] });
    }

    const matchedCustom = customList.filter((item) => item.name.toLowerCase().includes(query));
    const matchedDb = teamLogosList
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 40);

    const merged = [...matchedCustom, ...matchedDb];
    res.json({ results: merged, totalMatched: merged.length });
  });

  // AI Match Parser / Prediction Generator endpoint
  app.post("/api/ai/parse-and-predict", async (req, res) => {
    try {
      const { text, mode, tournament } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          success: true,
          source: "fallback",
          message: "API Key not provided, use standard rule parser",
        });
      }

      const prompt = `You are an elite football / soccer match script parser and prediction expert.
Convert or generate structured match predictions in Indonesian/English format suitable for "Football Script Generator".

Request details:
Mode: ${mode || "parse"} (either "parse" from raw text or "generate" upcoming fixtures)
Tournament / League Preference: ${tournament || "Top European & International"}
Input Text:
"""
${text || ""}
"""

Output valid JSON in this exact schema:
{
  "tournamentHeader": "string (e.g. UEFA CHAMPIONS LEAGUE QUALIFIERS or COPA LIBERTADORES)",
  "matches": [
    {
      "league": "string",
      "time": "HH:MM",
      "date": "DD/MM",
      "wib": "WIB • DD/MM",
      "homeTeam": "string",
      "awayTeam": "string",
      "score": "string (e.g. 3 : 0 or 2 : 1)",
      "fullDateTime": "DD/MM - HH:MM WIB",
      "hdp": "string (e.g. Team -0.75)",
      "ou": "string (e.g. Over 2.5)",
      "odds1x2": "string (e.g. 1: 1.65 | X: 3.80 | 2: 5.20)",
      "bestPick": "string (e.g. Home Win 2-0)",
      "insight": "string (brief 1-sentence analytical insight in Indonesian)",
      "homeProb": 60,
      "drawProb": 25,
      "awayProb": 15,
      "isSpecial": false,
      "specialHdpNote": "string (e.g. Pasaran Tipis)",
      "specialScoreNote": "string (e.g. Under 2.0 (Low Goal))"
    }
  ],
  "rawFormattedScript": "string formatted text in multi-line standard generator syntax"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsedData,
        source: "gemini",
      });
    } catch (error: any) {
      console.error("AI Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to process AI request",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
