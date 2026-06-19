//MobileBracket.tsx Shell for Mobile App
"use client";

import GameCard from "./GameCard";

type Team = {
  team_id: string;
  name: string;
  seed: number | null;
};

type Game = {
  game_id: number;
  round: number;
  region: string;
  team1: Team | null;
  team2: Team | null;
  winner: string | null;
  source_game1: number | null;
  source_game2: number | null;
};

export default function MobileBracket({ games }: { games: Game[] }) {
  const rounds = groupByRound(games);

  return (
    <div className="flex flex-col gap-8 p-4">
      {Object.entries(rounds).map(([round, roundGames]) => (
        <div key={round} className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-cyan-300">
            Round {round}
          </h2>

          <div className="flex flex-col gap-4">
            {roundGames.map((g) => (
              <GameCard key={g.game_id} game={g} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByRound(games: Game[]) {
  const grouped: Record<number, Game[]> = {};

  for (const g of games) {
    if (!grouped[g.round]) grouped[g.round] = [];
    grouped[g.round].push(g);
  }

  return grouped;
}

