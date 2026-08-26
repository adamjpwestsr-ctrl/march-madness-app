"use client";

import { useEffect, useState } from "react";

type HistoryRow = {
  week: number;
  team: string;
  abbrev: string;
  logo: string | null;
  correct: boolean;
  points: number;
};

export default function SurvivorHistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/nfl/survivor/history");
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
        <h1 className="text-3xl font-semibold">Survivor History</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Review all your Survivor picks week by week.
        </p>
      </section>

      {/* History List */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        {loading && (
          <div className="px-4 py-4 text-slate-400 text-sm">
            Loading history…
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="px-4 py-4 text-slate-400 text-sm">
            No Survivor picks yet.
          </div>
        )}

        {!loading &&
          rows.length > 0 &&
          rows.map((h) => (
            <div
              key={h.week}
              className="flex justify-between items-center px-4 py-3 border-b border-slate-800 text-sm bg-slate-900/40"
            >
              {/* Left side: Week + Team */}
              <div className="flex items-center gap-3">
                {h.logo && (
                  <img
                    src={h.logo}
                    alt={h.team}
                    className="w-8 h-8 rounded-full border border-slate-700 object-contain"
                  />
                )}

                <div className="flex flex-col">
                  <span className="font-medium text-slate-100">
                    Week {h.week}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {h.team} ({h.abbrev})
                  </span>
                </div>
              </div>

              {/* Right side: Correct / Incorrect */}
              <div className="flex flex-col items-end">
                <span
                  className={
                    h.correct
                      ? "text-emerald-400 font-semibold"
                      : "text-red-400 font-semibold"
                  }
                >
                  {h.correct ? "Correct" : "Incorrect"}
                </span>
                <span className="text-slate-400 text-xs">{h.points} pts</span>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
