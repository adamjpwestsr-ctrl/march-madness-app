"use client";

import { useEffect, useState } from "react";

export default function NFLWeeklyLeaderboard() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/nfl/weekly/leaderboard")
      .then((r) => r.json())
      .then((d) => setRows(d.rows));
  }, []);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold">NFL Weekly Leaderboard</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex justify-between px-4 py-3 border-b border-slate-800"
          >
            <span>{i + 1}. {r.name}</span>
            <span className="font-semibold">{r.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
