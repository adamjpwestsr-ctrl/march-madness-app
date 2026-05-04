"use client";

import GameCard from "./GameCard";

export default function MobileBracket({ games }) {
  const rounds = groupByRound(games);

  return (
    <div className="flex flex-col gap-8 px-2 pb-10">
      {rounds.map((round, i) => (
        <Round key={i} title={round.title} games={round.games} />
      ))}
    </div>
  );
}

function Round({ title, games }) {
  return (
    <section className="bg-slate-900/40 backdrop-blur rounded-xl border border-slate-800 p-4">
      <h2 className="text-xl font-bold mb-4 tracking-tight">{title}</h2>

      <div className="flex flex-col gap-4">
        {games.map((g) => (
          <GameCard key={g.game_id} game={g} />
        ))}
      </div>
    </section>
  );
}

function groupByRound(games) {
  const roundNames = {
    1: "Round of 64",
    2: "Round of 32",
    3: "Sweet 16",
    4: "Elite 8",
    5: "Final Four",
    6: "Championship",
  };

  const grouped = {};

  games.forEach((g) => {
    if (!grouped[g.round]) grouped[g.round] = [];
    grouped[g.round].push(g);
  });

  return Object.keys(grouped).map((round) => ({
    title: roundNames[round] ?? `Round ${round}`,
    games: grouped[round],
  }));
}
