// TEAM MODEL
export type Team = {
  id: number;
  name: string;
  seed: number;
  region: string;
  record: string;        // e.g. "28–4"
  conference: string;    // e.g. "ACC", "Big Ten", "Ivy League"
};

// GAME MODEL
export type Game = {
  id: number;
  round: number; // 1–6
  region: string;
  team1: string | null;
  team2: string | null;
  winner: string | null; // actual winner (admin‑set)
};

// USER PICKS
export type Picks = {
  [gameId: number]: string | null; // team name
};

// MULLIGAN STATE
export type MulliganState = {
  remaining: number;
};

// DOWNSTREAM ROUND OPTION (used in MulliganModal)
export type DownstreamRoundOption = {
  round: number;
  gameId: number;
  label: string;
};

// CONFERENCE STRENGTH TIERS
export type ConferenceTier =
  | "Power5"
  | "HighMajor"
  | "MidMajor"
  | "LowMajor"
  | "Ivy";

// MAP OF CONFERENCES → STRENGTH TIER
export const CONFERENCE_STRENGTH_MAP: Record<string, ConferenceTier> = {
  // Power 5
  "ACC": "Power5",
  "Big Ten": "Power5",
  "Big 12": "Power5",
  "SEC": "Power5",
  "Pac-12": "Power5",

  // High Majors
  "Big East": "HighMajor",
  "AAC": "HighMajor",
  "Mountain West": "HighMajor",

  // Mid Majors
  "A-10": "MidMajor",
  "WCC": "MidMajor",
  "MVC": "MidMajor",
  "Sun Belt": "MidMajor",
  "C-USA": "MidMajor",

  // Low Majors
  "Big Sky": "LowMajor",
  "Big South": "LowMajor",
  "Horizon": "LowMajor",
  "MAAC": "LowMajor",
  "MAC": "LowMajor",
  "MEAC": "LowMajor",
  "NEC": "LowMajor",
  "OVC": "LowMajor",
  "Patriot": "LowMajor",
  "SoCon": "LowMajor",
  "Southland": "LowMajor",
  "SWAC": "LowMajor",
  "Summit": "LowMajor",
  "ASUN": "LowMajor",

  // Ivy League
  "Ivy League": "Ivy",
};

// STRENGTH DISPLAY INFO
export const CONFERENCE_STRENGTH_DISPLAY: Record<
  ConferenceTier,
  { emoji: string; label: string }
> = {
  Power5: { emoji: "💪", label: "Power 5" },
  HighMajor: { emoji: "🔥", label: "High Major" },
  MidMajor: { emoji: "⚡", label: "Mid Major" },
  LowMajor: { emoji: "🌱", label: "Low Major" },
  Ivy: { emoji: "🎓", label: "Ivy League" },
};

// FUNCTION: GET TEAM STRENGTH
export function getTeamStrength(conference: string) {
  const tier = CONFERENCE_STRENGTH_MAP[conference] || "LowMajor";
  return CONFERENCE_STRENGTH_DISPLAY[tier];
}

export interface TournamentTeam {
  id: number;          // from tournament_teams
  region: string | null;
  seed: number | null;
  team: string;        // team_name
  bid_type: string | null;
  conference: string | null;
  record: string | null;
  logo_url: string | null;
}
