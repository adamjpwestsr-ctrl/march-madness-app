"use client";

import { useEffect, useState } from "react";
import { getF1Leaderboard } from "@/app/api/f1/actions";

type Props = {
  raceId: string;
};

export default async function F1LiveLeaderboard({ raceId }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getF1Leaderboard(raceId);
      setRows(data || []);
      setLoading(false);
    }
    load();
  }, [raceId]);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">🔥 Live F1 Leaderboard</h2>

      {loading ? (
        <p className="text-slate-400">Loading leaderboard...</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-400">No leaderboard data yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex justify-between text-slate-300 text-sm"
            >
              <span>{row.user_id}</span>
              <span className="font-semibold">{row.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
