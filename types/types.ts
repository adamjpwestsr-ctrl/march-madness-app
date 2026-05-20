// TEAM OBJECT USED THROUGHOUT THE APP
export type Team = {
  team_id: string;
  name: string;
  seed: number | null;
  record?: string | null;
  conference?: string | null;
};

// PICKS: game_id → team_id
export type Picks = Record<number, string>;

// INDIVIDUAL PICK ROW FROM DATABASE
export type Pick = {
  game_id: number;
  selected_team: string;     // team_id
  points_awarded?: number;
};

// GAME OBJECT USED THROUGHOUT THE APP
export type Game = {
  game_id: number;
  round: number;
  region: string;
  team1: Team | null;
  team2: Team | null;
  winner: string | null;     // team_id
  source_game1: number | null;
  source_game2: number | null;
};

// EXTRA TEAM METRICS (OPTIONAL)
export type TeamData = {
  seed: number;
  conference: string;
  record: string;
  conference_record: string;
  net: number;
  kenpom: number;
  adj_o: number;
  adj_d: number;
  quad1: string;
  quad2: string;
  best_win: string;
  worst_loss: string;
  streak: string;
  last10: string;
};
