"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

export default function NcaafGameCard({
  game,
  onPick,
}: {
  game: any;
  onPick: (teamId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  function choose(teamId: string) {
    setSelected(teamId);
    onPick(teamId);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-300 text-sm">
        <Flag size={16} className="text-yellow-400" />
        {new Date(game.start).toLocaleString()}
      </div>

      <div className="flex flex-col gap-3">
        {/* Away */}
        <button
          onClick={() => choose(game.away_team_id)}
          className={`flex justify-between items-center px-3 py-2 rounded-md border ${
            selected === game.away_team_id
              ? "bg-yellow-500 text-slate-900 border-yellow-400"
              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          }`}
        >
          <span>
            {game.away_rank ? `#${game.away_rank} ` : ""}
            {game.away_team}
          </span>
          <span className="font-semibold">{game.away_score ?? "-"}</span>
        </button>

        {/* Home */}
        <button
          onClick={() => choose(game.home_team_id)}
          className={`flex justify-between items-center px-3 py-2 rounded-md border ${
            selected === game.home_team_id
              ? "bg-yellow-500 text-slate-900 border-yellow-400"
              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          }`}
        >
          <span>
            {game.home_rank ? `#${game.home_rank} ` : ""}
            {game.home_team}
          </span>
          <span className="font-semibold">{game.home_score ?? "-"}</span>
        </button>
      </div>
    </div>
  );
}
