"use client";

import { useEffect, useState } from "react";

export default function WeeklyLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trivia/weekly/leaderboard", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }

        const json = await res.json();

        if (!json || !Array.isArray(json.leaderboard)) {
          throw new Error("Invalid leaderboard format");
        }

        setLeaderboard(json.leaderboard);
      } catch (err: any) {
        console.error("Weekly leaderboard load error:", err);
        setError("Unable to load weekly leaderboard.");
      }
    }

    load();
  }, []);

  if (error) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-300">
        {error}
      </div>
    );
  }

  if (!leaderboard) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
        Loading weekly leaderboard…
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
      <h2 className="text-xl font-semibold mb-4">Weekly Leaderboard</h2>

      {leaderboard.length === 0 && (
        <p className="text-slate-400">No results yet for this week.</p>
      )}

      <div className="space-y-3">
        {leaderboard.map((entry: any, i: number) => (
          <div
            key={entry.id}
            className="p-3 rounded-lg bg-slate-800/40 border border-slate-700"
          >
            <strong className="text-slate-200">
              {i + 1}. {entry.display_name}
            </strong>
            <span className="text-slate-400"> — {entry.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
