"use client";

import { useEffect, useState } from "react";

interface LeaderboardRow {
  user_id: number;
  name: string;
  email: string;
  points: number;
}

export default function PlayoffLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    fetch("/sports/nfl/playoffs/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/40 backdrop-blur-md border border-slate-700/60 rounded-sm p-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">
        Playoff Leaderboard
      </h2>

      <div className="flex flex-col gap-3">
        {leaderboard.map((row, idx) => (
          <div
            key={row.user_id}
            className="flex justify-between items-center bg-white/5 border border-slate-700/60 rounded-sm px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400 w-6 text-right">{idx + 1}</span>
              <span className="font-medium">{row.name}</span>
            </div>
            <span className="font-bold text-emerald-400">{row.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
