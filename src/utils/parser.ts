import { MatchItem, MatchGroup } from "../types";
import { getTeamLogoUrl, stripTeamBrackets } from "../data/teamLogos";

/**
 * Clean and normalize team name from prefixes/suffixes like [10] Goias GO or Levski Sofia [n]
 */
export function cleanTeamName(name: string): string {
  if (!name || typeof name !== "string") return "";
  return stripTeamBrackets(name);
}

/**
 * Intelligent parser that decodes raw football prediction script text into structured objects
 */
export function parseMatchScript(rawText: string): {
  groups: MatchGroup[];
  totalMatches: number;
} {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { groups: [], totalMatches: 0 };
  }

  const groups: MatchGroup[] = [];
  let currentLeague = "MATCH PREDICTIONS";
  let currentLeagueMatches: MatchItem[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check if this line looks like a league header
    if (isLeagueHeader(line, lines, i)) {
      if (currentLeagueMatches.length > 0) {
        groups.push({
          league: currentLeague,
          matches: currentLeagueMatches,
        });
        currentLeagueMatches = [];
      }
      currentLeague = cleanLeagueName(line);
      i++;
      continue;
    }

    // Check if line is a Time (HH:MM or HH.MM)
    if (isTimeLine(line)) {
      const time = line;
      let wibString = "WIB";
      let date = "TODAY";
      let homeTeam = "";
      let awayTeam = "";
      let score = "0 : 0";

      // Look ahead for WIB • DD/MM line
      let nextIdx = i + 1;
      if (nextIdx < lines.length && isWibDateLine(lines[nextIdx])) {
        wibString = lines[nextIdx];
        const dateMatch = lines[nextIdx].match(/(\d{1,2}[\/\-\.]\d{1,2})/);
        if (dateMatch) date = dateMatch[1];
        nextIdx++;
      }

      // Next should be Home Team
      if (nextIdx < lines.length) {
        homeTeam = cleanTeamName(lines[nextIdx]);
        nextIdx++;
      }

      // Next might be "VS" or "vs" or "-"
      if (nextIdx < lines.length && isVsLine(lines[nextIdx])) {
        nextIdx++;
      }

      // Next should be Away Team
      if (nextIdx < lines.length) {
        awayTeam = cleanTeamName(lines[nextIdx]);
        nextIdx++;
      }

      // Next might be Score "3 : 0" or "2-0" or "FT 1:0"
      if (nextIdx < lines.length && isScoreLine(lines[nextIdx])) {
        score = cleanScore(lines[nextIdx]);
        nextIdx++;
      }

      if (homeTeam && awayTeam) {
        const matchItem = createMatchItem(
          currentLeague,
          time,
          date,
          wibString,
          homeTeam,
          awayTeam,
          score
        );
        currentLeagueMatches.push(matchItem);
        i = nextIdx;
        continue;
      }
    }

    // Alternative: Check for "Team A VS Team B" in single line
    const vsMatch = line.match(/^(.+?)\s+(?:VS|vs|v|\-)\s+(.+?)(?:\s+([\d]+\s*[\:\-]\s*[\d]+))?$/i);
    if (vsMatch && !isVsLine(line)) {
      const homeTeam = cleanTeamName(vsMatch[1]);
      const awayTeam = cleanTeamName(vsMatch[2]);
      const score = vsMatch[3] ? cleanScore(vsMatch[3]) : "0 : 0";
      const matchItem = createMatchItem(
        currentLeague,
        "20:00",
        "TODAY",
        "WIB • LIVE",
        homeTeam,
        awayTeam,
        score
      );
      currentLeagueMatches.push(matchItem);
      i++;
      continue;
    }

    // Fallback: move forward
    i++;
  }

  if (currentLeagueMatches.length > 0) {
    groups.push({
      league: currentLeague,
      matches: currentLeagueMatches,
    });
  }

  const totalMatches = groups.reduce((acc, g) => acc + g.matches.length, 0);
  return { groups, totalMatches };
}

function isLeagueHeader(line: string, allLines: string[], index: number): boolean {
  const upper = line.toUpperCase();
  const knownTournaments = [
    "CHAMPIONS LEAGUE",
    "COPA LIBERTADORES",
    "ASEAN CHAMPIONSHIP",
    "PREMIER LEAGUE",
    "LA LIGA",
    "SERIE A",
    "BUNDESLIGA",
    "LIGA 1",
    "WORLD CUP",
    "EURO",
    "QUALIFIERS",
    "LEAGUE",
    "CUP",
    "CONCACAF",
    "CONMEBOL",
    "AFC",
    "FRIENDLY",
    "FA CUP",
    "CARABAO",
    "EUROPA",
  ];

  if (knownTournaments.some((t) => upper.includes(t))) {
    return true;
  }

  if (
    line === line.toUpperCase() &&
    line.length >= 4 &&
    !isTimeLine(line) &&
    !isScoreLine(line) &&
    !isVsLine(line) &&
    !line.includes("WIB") &&
    index + 1 < allLines.length &&
    isTimeLine(allLines[index + 1])
  ) {
    return true;
  }

  return false;
}

function isTimeLine(line: string): boolean {
  return /^(?:[01]?\d|2[0-3])[\:\.][0-5]\d(?:\s*WIB|\s*PM|\s*AM)?$/i.test(line.trim());
}

function isWibDateLine(line: string): boolean {
  return /WIB/i.test(line) || /\d{1,2}[\/\-\.]\d{1,2}/.test(line);
}

function isVsLine(line: string): boolean {
  return /^(?:VS|vs|V|v|\-)$/i.test(line.trim());
}

function isScoreLine(line: string): boolean {
  return /^\d{1,2}\s*[\:\-]\s*\d{1,2}$/.test(line.trim());
}

function cleanScore(line: string): string {
  const match = line.match(/(\d{1,2})\s*[\:\-]\s*(\d{1,2})/);
  if (match) {
    return `${match[1]} : ${match[2]}`;
  }
  return line.trim();
}

function cleanLeagueName(line: string): string {
  return line
    .replace(/^🏆\s*/, "")
    .replace(/\s*🏆$/, "")
    .trim();
}

function createMatchItem(
  league: string,
  time: string,
  date: string,
  wibString: string,
  homeTeam: string,
  awayTeam: string,
  score: string
): MatchItem {
  const id = `match_${Math.random().toString(36).substr(2, 9)}`;

  // Parse scores to derive probabilities & market odds
  const scoreParts = score.split(":").map((s) => parseInt(s.trim(), 10) || 0);
  const homeGoals = scoreParts[0] ?? 0;
  const awayGoals = scoreParts[1] ?? 0;

  let homeProb = 48;
  let drawProb = 28;
  let awayProb = 24;

  if (homeGoals > awayGoals) {
    const diff = homeGoals - awayGoals;
    homeProb = Math.min(85, 55 + diff * 10);
    drawProb = Math.max(10, 30 - diff * 6);
    awayProb = 100 - homeProb - drawProb;
  } else if (awayGoals > homeGoals) {
    const diff = awayGoals - homeGoals;
    awayProb = Math.min(80, 50 + diff * 10);
    drawProb = Math.max(10, 30 - diff * 6);
    homeProb = 100 - awayProb - drawProb;
  } else {
    drawProb = 42;
    homeProb = 31;
    awayProb = 27;
  }

  // Derive Handicap (HDP) & Over/Under (O/U)
  const totalGoals = homeGoals + awayGoals;
  const ou = totalGoals >= 3 ? "Over 2.5 Goals" : "Under 2.5 Goals";
  let hdp = "0 : 1/2";
  if (homeGoals > awayGoals) {
    const diff = homeGoals - awayGoals;
    hdp = diff >= 2 ? "0 : 1.5" : "0 : 1/2";
  } else if (awayGoals > homeGoals) {
    const diff = awayGoals - homeGoals;
    hdp = diff >= 2 ? "1.5 : 0" : "1/2 : 0";
  } else {
    hdp = "0 : 0 (Fair)";
  }

  const odds1x2 = `1: ${(100 / Math.max(homeProb, 15)).toFixed(2)} | X: ${(100 / Math.max(drawProb, 15)).toFixed(2)} | 2: ${(100 / Math.max(awayProb, 15)).toFixed(2)}`;
  const bestPick = homeGoals > awayGoals ? `${homeTeam} HDP Win (${score})` : awayGoals > homeGoals ? `${awayTeam} Win (${score})` : `Draw (${score})`;

  const insightTemplates = [
    `${homeTeam} mendominasi statistik penguasaan bola dan rekor kandang terakhir.`,
    `${homeTeam} vs ${awayTeam} diprediksi berlangsung sengit dengan peluang gol di babak kedua.`,
    `Performa lini serang ${homeGoals >= awayGoals ? homeTeam : awayTeam} sedang dalam kondisi puncak dan agresif.`,
    `Pertahanan solid ${homeTeam} diprediksi mampu meredam transisi cepat ${awayTeam}.`,
  ];
  const insight = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];

  // Special match notes matching screenshot
  const specialHdpNote = totalGoals <= 1 ? "Pasaran Tipis" : "Pasaran Terbuka";
  const specialScoreNote = totalGoals <= 2 ? "Under 2.0 (Low Goal)" : "Over 2.5 (High Goal)";

  return {
    id,
    league,
    time: time.replace(/WIB/i, "").trim(),
    date,
    wibString,
    homeTeam,
    awayTeam,
    score,
    homeLogo: getTeamLogoUrl(homeTeam),
    awayLogo: getTeamLogoUrl(awayTeam),
    homeProb,
    drawProb,
    awayProb,
    hdp,
    ou,
    odds1x2,
    bestPick,
    insight,
    isExpanded: false,
    specialHdpNote,
    specialScoreNote,
  };
}
