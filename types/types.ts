export type Picks = Record<number, string>

export type Game = {
  game_id: number
  round: number
  region: string
  team1: string | null
  team2: string | null
  seed1: number | null
  seed2: number | null
  source_game1: number | null
  source_game2: number | null
  winner?: string | null
}

export type Pick = {
  game_id: number
  selected_team: string
  winner?: string | null
  points_awarded?: number
}

export type TeamData = {
  seed: number
  conference: string
  record: string
  conference_record: string
  net: number
  kenpom: number
  adj_o: number
  adj_d: number
  quad1: string
  quad2: string
  best_win: string
  worst_loss: string
  streak: string
  last10: string
}
