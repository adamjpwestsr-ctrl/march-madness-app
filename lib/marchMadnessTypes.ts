// lib/marchMadnessTypes.ts

// -----------------------------
// GAME STRUCTURE
// -----------------------------
export type TournamentGame = {
  id: number;

  // Linking & structure
  round_id: number | null;
  round: number | null;          // 1 = Opening Round, 2 = Round of 64, etc.
  region: string | null;         // East, West, South, Midwest, or "At-Large"

  game_number: number;           // Unique within round
  winner_to_game_id: number | null; // For bracket advancement

  // Teams
  team1_id: number | null;
  team2_id: number | null;

  team1: string | null;
  team2: string | null;

  seed1: number | null;          // NEW — needed for Opening Round
  seed2: number | null;          // NEW

  // Results
  winner: string | null;
  completed: boolean;

  // Metadata
  site: string | null;
  scheduled_at: string | null;
  is_placeholder: boolean;

  // Bracket ownership (null for global tournament games)
  bracket_id: string | null;
};

// -----------------------------
// TEAM STRUCTURE
// -----------------------------
export type TournamentTeam = {
  id: number;
  team: string;

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
