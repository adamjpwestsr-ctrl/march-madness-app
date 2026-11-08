/* -------------------------------------------------------
   BRACKETBOSS — CONFERENCE STRENGTH CONFIGURATION

   Provisional ratings on a 0–100 scale.
   Higher score = stronger conference profile.

   These values are intended to contribute to the matchup
   model, not determine the outcome by themselves.

   Future: Replace this static map with Supabase data
   without changing the matchup-scoring engine.
------------------------------------------------------- */

const CONFERENCE_STRENGTH: Record<string, number> = {
  // Major conferences
  SEC: 95,
  "Big Ten": 93,
  "Big 12": 91,
  ACC: 88,
  "Big East": 86,

  // Strong mid-major conferences
  "Mountain West": 80,
  WCC: 77,
  AAC: 75,
  "Atlantic 10": 74,
  A10: 74,
  MVC: 71,
  "Missouri Valley": 71,

  // Other Division I conferences
  "Conference USA": 68,
  CUSA: 68,
  "Sun Belt": 67,
  MAC: 66,
  "Mid-American": 66,
  "Ivy League": 65,
  Ivy: 65,
  "American East": 64,
  "America East": 64,
  "Big Sky": 64,
  "Horizon League": 64,
  Horizon: 64,
  "Patriot League": 63,
  "Summit League": 63,
  Summit: 63,
  "Big South": 62,
  "Ohio Valley": 62,
  OVC: 62,
  "Western Athletic": 61,
  WAC: 61,
  "Northeast Conference": 60,
  NEC: 60,
  "Metro Atlantic": 60,
  MAAC: 60,
  "Southern Conference": 60,
  SoCon: 60,
  "Southland Conference": 59,
  Southland: 59,
  "America South": 59,
  MEAC: 57,
  SWAC: 57,
};

/* -------------------------------------------------------
   NORMALIZE CONFERENCE NAMES

   Makes matching resilient to capitalization and
   common naming variations.
------------------------------------------------------- */

function normalizeConferenceName(conference?: string | null): string {
  if (!conference) return "";

  const normalized = conference
    .trim()
    .toLowerCase()
    .replace(/[.-]/g, "")
    .replace(/\s+/g, " ");

  const aliases: Record<string, string> = {
    "southeastern conference": "sec",
    "big 10": "big ten",
    "big twelve": "big 12",
    "atlantic coast conference": "acc",
    "big east conference": "big east",
    "western athletic conference": "wac",
    "mountain west conference": "mountain west",
    "west coast conference": "wcc",
    "american athletic conference": "aac",
    "atlantic 10 conference": "a10",
    "missouri valley conference": "mvc",
    "mid american conference": "mac",
    "conference usa": "cusa",
  };

  return aliases[normalized] ?? normalized;
}

/* -------------------------------------------------------
   GET CONFERENCE STRENGTH

   Returns:
   - number: known conference rating
   - null: unknown or missing conference

   Unknown conferences are NOT assigned an artificial
   low rating. The matchup engine can treat missing
   conference information as neutral.
------------------------------------------------------- */

export function getConferenceStrength(
  conference?: string | null
): number | null {
  const normalized = normalizeConferenceName(conference);

  if (!normalized) return null;

  for (const [name, rating] of Object.entries(CONFERENCE_STRENGTH)) {
    if (normalizeConferenceName(name) === normalized) {
      return rating;
    }
  }

  return null;
}

/* -------------------------------------------------------
   EXPORT CONFIGURATION FOR DISPLAY / FUTURE ADMIN TOOLS
------------------------------------------------------- */

export function getConferenceStrengthRatings() {
  return { ...CONFERENCE_STRENGTH };
}