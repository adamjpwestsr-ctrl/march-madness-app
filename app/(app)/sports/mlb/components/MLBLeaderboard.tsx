"use client";

import { useEffect, useState } from "react";

export default function MLBLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/app/api/mlb/weekly/leaderboard");
        const json = await res.json();
        setLeaderboard(json.leaderboard || []);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading leaderboard…</p>
      ) : leaderboard.length === 0 ? (
        <p className="text-slate-400 text-sm">No leaderboard data yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {leaderboard.map((row, i) => (
            <div
              key={row.user_id}
              className="flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded-lg"
            >
              <span className="text-slate-300 font-medium">
                {i + 1}. User {row.user_id.slice(0, 6)}
              </span>

              <span className="text-emerald-400 font-bold">
                {row.total_points} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
