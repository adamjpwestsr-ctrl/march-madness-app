// lib/marchMadnessTypes.ts

// -----------------------------
// GAME STRUCTURE
// -----------------------------
export type TournamentGame = {
  id: string;                    // Supabase UUID

  // Linking & structure
  round_id: string | null;       // Not used yet, but required by your type
  round: number | null;          // 1 = Opening Round, 2 = Round of 64, etc.
  region: string | null;         // East, West, South, Midwest, or "At-Large"

  game_number: number;           // Unique within round
  winner_to_game_id: string | null;

  // Teams (normalized from joined Supabase data)
  team1_id: string | null;
  team2_id: string | null;

  // Legacy fields (your UI still expects these)
  team1: string | null;
  team2: string | null;

  // Seeds (from joined team objects)
  seed1: number | null;
  seed2: number | null;

  // Results
  winner: string | null;
  completed: boolean;

  // Scores (added because your API now returns them)
  home_score: number;
  away_score: number;

  // Metadata
  site: string | null;
  scheduled_at: string | null;
  is_placeholder: boolean;

  // Status (added because your API returns it)
  status: string;

  // Bracket ownership (null for global tournament games)
  bracket_id: string | null;
};

// -----------------------------
// TEAM STRUCTURE
// -----------------------------
export type TournamentTeam = {
  id: string;                    // Supabase UUID
  team: string;                  // Team name

  region: string;                // East, West, South, Midwest
  seed: number;                  // 1–16 (or play‑in seeds)

  bid_type: 'auto' | 'at_large' | null;
  conference: string | null;
  record: string | null;

  logo_url: string | null;       // ESPN logo
};

// -----------------------------
// BRACKET SUMMARY
// -----------------------------
export type BracketSummary = {
  bracket_id: string;
  bracket_name: string;
  icon: string | null;

  created_at: string | null;
  tiebreaker_score: number | null;

  mulligans_remaining: number | null;
  submitted: boolean;
};

// -----------------------------
// LEADERBOARD
// -----------------------------
export interface LeaderboardRow {
  bracket_id: string;
  bracket_name: string;
  icon: string | null;

  earned_points: number;
  possible_points: number;
  max_possible_score: number;
  mulligans_used: number;

  email: string | null;
  has_paid: boolean;
  is_active: boolean;
}

// -----------------------------
// MULLIGANS
// -----------------------------
export type MulliganSummary = {
  mulligan_id: string;
  bracket_id: string;
  game_id: number;

  original_team: string;
  replacement_team: string;

  approved_at: string | null;
  mulligan_number: number;
};

// -----------------------------
// LIVE GAME DATA (ESPN)
// -----------------------------
export type LiveGameSummary = {
  game_id: string;               // ESPN game ID

  home_team: string;
  away_team: string;

  home_score: number | null;
  away_score: number | null;

  status: string;                // pre, in, post

  region: string | null;
  round: number | null;
};

// -----------------------------
// FULL STATE PAYLOAD
// -----------------------------
export type MarchMadnessState = {
  brackets: BracketSummary[];

  openingRoundGames: TournamentGame[];
  regionalGames: Record<string, TournamentGame[]>;

  teams: TournamentTeam[];

  leaderboard: LeaderboardRow[];
  mulligans: MulliganSummary[];

  lockState: {
    bracketsOpen: boolean;
    openingRoundComplete: boolean;
  };

  liveSummary: LiveGameSummary[];
};
