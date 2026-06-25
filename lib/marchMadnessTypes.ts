// lib/marchMadnessTypes.ts

export type TournamentGame = {
  id: number;
  round_id: number | null;
  game_number: number;
  team1_id: number | null;
  team2_id: number | null;
  winner_to_game_id: number | null;
  site: string | null;
  scheduled_at: string | null;
  completed: boolean;
  bracket_id: string | null;
  round: number | null;
  region: string | null;
  team1: string | null;
  team2: string | null;
  winner: string | null;
  is_placeholder: boolean;
};

export type TournamentTeam = {
  id: number;
  region: string;
  seed: number;
  team: string;
  bid_type: 'auto' | 'at_large' | null;
  conference: string | null;
  record: string | null;
  logo_url: string | null;
};

export type BracketSummary = {
  bracket_id: string;
  bracket_name: string;
  icon: string | null;
  created_at: string | null;
  tiebreaker_score: number | null;
  mulligans_remaining: number | null;
  submitted: boolean;
};

export type LeaderboardRow = {
  bracket_id: string;
  bracket_name: string;
  icon: string | null;
  earned_points: number;
  possible_points: number;
  max_possible_score: number;
  mulligans_used: number;
};

export type MulliganSummary = {
  mulligan_id: string;
  bracket_id: string;
  game_id: number;
  original_team: string;
  replacement_team: string;
  approved_at: string | null;
  mulligan_number: number;
};

export type LiveGameSummary = {
  game_id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string; // pre, in, post
  region: string | null;
  round: number | null;
};

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
