"use client";

import { useEffect, useState } from "react";

export default function NascarLiveLeaderboard({ raceId }: { raceId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
const res = await fetch(`/api/nascar?type=live-leaderboard&raceId=${raceId}`);
if (!res.ok) {
  console.error("Leaderboard fetch failed:", res.status);
  setRows([]);
  setLoading(false);
  return;
}

let data = [];
try {
  data = await res.json();
} catch (err) {
  console.error("Failed to parse leaderboard JSON:", err);
  data = [];
}
setRows(data || []);
setLoading(false);
      setRows(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, [raceId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
        Loading leaderboard...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
        No leaderboard data available yet.
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">🏆 Live Leaderboard</h2>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-slate-800/40 border border-slate-700 rounded-lg p-3"
          >
            {/* User */}
            <div className="flex flex-col">
              <span className="text-white font-semibold">{row.username}</span>
              <span className="text-slate-400 text-sm">Picked: {row.driver_name}</span>
            </div>

            {/* Driver Performance */}
            <div className="flex items-center gap-4 text-slate-300 text-sm">
              <span>Lap Lead: {row.led_laps ? "✔" : "—"}</span>
              <span>Stage Wins: {row.stage_wins}</span>
              <span>Race Win: {row.race_win ? "🏁" : "—"}</span>
            </div>

            {/* Points */}
            <div className="text-emerald-400 font-bold text-lg">
              {row.total_points} pts
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
