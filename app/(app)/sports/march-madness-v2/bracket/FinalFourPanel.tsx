"use client";

import React from "react";
import MatchupCard from "./MatchupCard";

export default function FinalFourPanel({
  matchups,
  onPick,
}: {
  matchups: any[]; // array of two semifinal games
  onPick: (gameId: string, teamId: string) => void;
}) {
  return (
    <div className="rounded-xl bg-slate-900/40 border border-white/10 p-6 shadow-lg backdrop-blur-sm">
      {/* TITLE */}
      <h2 className="text-3xl font-bold text-center text-yellow-400 tracking-tight mb-6 drop-shadow">
        Final Four
      </h2>

      {/* SEMIFINAL MATCHUPS */}
      <div className="flex flex-col gap-6">
        {matchups.map((game) => (
          <MatchupCard
            key={game.id}
            game={game}
            roundId="final-four"
            onPick={onPick}
          />
        ))}
      </div>
    </div>
  );
}
