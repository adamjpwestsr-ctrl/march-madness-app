export type Game = {
  id: number;
  round: number; // 1–6
  region: string;
  team1: string | null;
  team2: string | null;
  winner: string | null; // actual winner (admin‑set)
};

export type Picks = {
  [gameId: number]: string | null; // team name
};

export type MulliganState = {
  remaining: number;
};

export type DownstreamRoundOption = {
  round: number;
  gameId: number;
  label: string;
};
