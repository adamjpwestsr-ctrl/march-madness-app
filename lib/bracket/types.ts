export interface Team {
  id: number;
  name: string;
  seed: number;
  region: string;
  bid_type: 'auto' | 'at_large';
}

export interface Game {
  id?: number;
  roundId?: number;
  gameNumber: number;
  team1_id?: number | null;
  team2_id?: number | null;
  winner_id?: number | null;
  winner_to_game_id?: number | null;
}

export interface BracketState {
  openingRound: Game[];
  roundOf64: Game[];
  roundOf32: Game[];
  sweet16: Game[];
  elite8: Game[];
  final4: Game[];
  championship: Game[];
}

