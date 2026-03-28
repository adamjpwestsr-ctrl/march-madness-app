export type Picks = Record<number, string>;

export type Game = {
  game_id: number;
  round: number;
  region: string;
  team1: string | null;
  team2: string | null;
  seed1: number | null;
  seed2: number | null;
  source_game1: number | null;
  source_game2: number | null;
  winner?: string | null;
};

export type Pick = {
  game_id: number;
  selected_team: string;
  winner?: string | null;
  points_awarded?: number;
};
