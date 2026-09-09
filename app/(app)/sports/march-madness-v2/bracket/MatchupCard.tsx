"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function MatchupCard({
  game,
  roundId,
  onPick,
}: {
  game: any;
  roundId: string;
  onPick: (gameId: string, teamId: string) => void;
}) {
  const { id, home, away, selectedTeamId } = game;

  const handlePick = (teamId: string) => {
    onPick(id, teamId);
  };

  return (
    <div className="rounded-xl bg-slate-800/40 border border-white/10 p-4 shadow-md hover:shadow-xl transition-all backdrop-blur-sm">
      {/* TEAM 1 */}
      <button
        onClick={() => handlePick(home.id)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
          selectedTeamId === home.id
            ? "bg-yellow-500 text-black font-bold shadow-lg"
            : "hover:bg-slate-700/40 text-slate-300"
        )}
      >
        <img
          src={home.logo_url}
          className="w-10 h-10 rounded-md shadow"
          alt={home.name}
        />
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold">{home.name}</span>
          <span className="text-xs text-slate-400">Seed {home.seed}</span>
        </div>
      </button>

      {/* VS DIVIDER */}
      <div className="text-center text-slate-500 text-xs my-2">vs</div>

      {/* TEAM 2 */}
      <button
        onClick={() => handlePick(away.id)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
          selectedTeamId === away.id
            ? "bg-yellow-500 text-black font-bold shadow-lg"
            : "hover:bg-slate-700/40 text-slate-300"
        )}
      >
        <img
          src={away.logo_url}
          className="w-10 h-10 rounded-md shadow"
          alt={away.name}
        />
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold">{away.name}</span>
          <span className="text-xs text-slate-400">Seed {away.seed}</span>
        </div>
      </button>
    </div>
  );
}
