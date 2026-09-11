"use client";

import React from "react";
import MatchupCard from "./MatchupCard";

export default function RoundColumn({
  title,
  games,
  roundId,
  onPick,
}: {
  title: string;
  games: any[];
  roundId: string;
  onPick: (gameId: string, teamId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/10 shadow-md">
      {/* ROUND TITLE */}
      <h3 className="text-xl font-bold text-yellow-400 text-center mb-2">
        {title}
      </h3>

      {/* MATCHUPS */}
      {games.length === 0 && (
        <p className="text-center text-slate-500 text-sm">
          No games available.
        </p>
      )}

      {games.map((game) => (
        <MatchupCard
          key={game.id}
          game={game}
          roundId={roundId}
          onPick={onPick}
        />
      ))}
    </div>
  );
}
