"use client";

import { useEffect, useState } from "react";

type ChampionRow = {
  champion_team: string;
  selection_count: number;
};

export default function ChampionStats() {
  const [teams, setTeams] = useState<ChampionRow[]>([]);

  const loadTeams = async () => {
const res = await fetch("/api/march-madness-v2/topChampions");
    const data = await res.json();
    setTeams(data);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  if (!teams.length) return null;

  return (
    <div className="mt-6 bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
      <h3 className="text-xl font-bold text-yellow-400 mb-3">
        🏆 Top 5 Champion Selections
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {teams.map((team) => (
          <div
            key={team.champion_team}
            className="flex flex-col items-center bg-slate-800/60 rounded-lg p-3 hover:scale-105 transition-transform shadow-slate-900/50"
          >
            {/* logo path can be adjusted to your real logo source */}
            <div className="w-10 h-10 mb-2 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
              {team.champion_team.slice(0, 3).toUpperCase()}
            </div>
            <span className="text-yellow-400 font-semibold text-sm text-center">
              {team.champion_team}
            </span>
            <span className="text-slate-300 text-xs">
              {team.selection_count} picks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
