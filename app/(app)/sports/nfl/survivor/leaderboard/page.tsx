"use client";

import { useEffect, useState } from "react";

type Row = {
  user_id: string;
  name: string | null;
  longestStreak: number;
  currentStreak: number;
  totalCorrect: number;
  eliminatedWeek: number | null;
  rank: number;
};

export default function SurvivorLeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/nfl/survivor/leaderboard");
      const data = await res.json();
      setRows(data.rows || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col gap-8 p-6">
      {/* Header */}
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">NFL Survivor Leaderboard</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Rankings are based on longest streak, total correct picks, and earliest elimination.
        </p>
      </section>

      {/* Leaderboard */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        {loading && (
          <div className="px-4 py-4 text-slate-400 text-sm">
            Loading leaderboard…
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="px-4 py-4 text-slate-400 text-sm">
            No leaderboard data available yet.
          </div>
        )}

        {!loading &&
          rows.length > 0 &&
          rows.map((r, i) => (
            <div
              key={r.user_id}
              className={`flex justify-between items-center px-4 py-3 border-b border-slate-800 text-sm ${
                i === 0
                  ? "bg-emerald-900/40"
                  : i === 1
                  ? "bg-slate-900/70"
                  : "bg-slate-900/40"
              }`}
            >
              {/* Left side: Rank + Name */}
              <div className="flex items-center gap-3">
                <span className="w-6 text-slate-400">{r.rank}.</span>
                <span className="font-medium">
                  {r.name || `User ${r.user_id.slice(0, 6)}`}
                </span>
              </div>

              {/* Right side: Streak + Status */}
              <div className="flex flex-col items-end">
                <span className="font-semibold text-slate-100">
                  {r.longestStreak} wk streak
                </span>

                {r.eliminatedWeek === null ? (
                  <span className="text-emerald-400 text-xs font-medium">
                    Still Alive
                  </span>
                ) : (
                  <span className="text-red-400 text-xs font-medium">
                    Eliminated (Week {r.eliminatedWeek})
                  </span>
                )}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
