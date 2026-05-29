"use client";

import { useEffect, useState } from "react";

type Row = {
  week: number;
  team: string;
  abbrev: string;
  logo: string | null;
  correct: boolean;
  points: number;
};

export default function NFLWeeklyHistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/nfl/weekly/history");
      const data = await res.json();
      setRows(data.rows || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">My NFL Weekly Pick History</h1>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        {loading && <p className="text-slate-400">Loading history…</p>}

        {!loading && rows.length === 0 && (
          <p className="text-slate-400">No picks made yet.</p>
        )}

        {!loading &&
          rows.length > 0 &&
          rows.map((r) => (
            <div
              key={r.week}
              className="flex items-center justify-between px-4 py-3 border-b border-slate-800"
            >
              <div className="flex items-center gap-3">
                {r.logo && (
                  <img
                    src={r.logo}
                    alt={r.team}
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-slate-100">
                    Week {r.week}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {r.team} ({r.abbrev})
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className={
                    r.correct
                      ? "text-emerald-400 font-semibold"
                      : "text-red-400 font-semibold"
                  }
                >
                  {r.correct ? "Correct" : "Incorrect"}
                </span>
                <span className="text-slate-400 text-xs">
                  {r.points} pts
                </span>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
