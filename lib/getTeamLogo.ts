import { teamLogos } from "./teamLogos";
import { teamNameAliases } from "./teamNameAliases";

export function getTeamLogo(rawName?: string | null): string | null {
  if (!rawName || typeof rawName !== "string") return null;

  // Normalize the incoming name
  const name = normalizeName(rawName);

  // 1. Direct match
  if (teamLogos[name]) return teamLogos[name];

  // 2. Alias match
  const alias = teamNameAliases[name];
  if (alias && teamLogos[alias]) return teamLogos[alias];

  // 3. Try fuzzy fallback (e.g., "uconn" → "connecticut")
  const fuzzy = fuzzyMatch(name);
  if (fuzzy && teamLogos[fuzzy]) return teamLogos[fuzzy];

  // 4. No match found
  if (process.env.NODE_ENV === "development") {
    console.warn(`[getTeamLogo] No logo found for team: "${rawName}" (normalized: "${name}")`);
  }

  return null;
}

// -----------------------------
// Helpers
// -----------------------------

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "") // remove punctuation
    .replace(/\s+/g, " ");      // collapse spaces
}

// Fuzzy match: find closest alias or team name
function fuzzyMatch(name: string): string | null {
  const allKeys = [
    ...Object.keys(teamLogos),
    ...Object.keys(teamNameAliases),
  ];

  // Simple contains-based fuzzy match
  for (const key of allKeys) {
    if (name.includes(key) || key.includes(name)) {
      return teamNameAliases[key] ?? key;
    }
  }

  return null;
}
