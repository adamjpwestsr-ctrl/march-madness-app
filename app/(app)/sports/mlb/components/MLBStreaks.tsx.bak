"use client";

import { useEffect, useState } from "react";

export default function MLBStreaks() {
  const [streaks, setStreaks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/app/api/mlb/weekly/streaks");
        const json = await res.json();
        setStreaks(json.streaks || []);
      } catch (err) {
        console.error("Streaks fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Streaking Teams</h2>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading streaks…</p>
      ) : streaks.length === 0 ? (
        <p className="text-slate-400 text-sm">No streak data yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {streaks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <img
                  src={t.logo_url}
                  alt={t.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-slate-300">{t.abbreviation}</span>
              </div>

              <span
                className={
                  t.status === "hot"
                    ? "text-emerald-400 font-bold"
                    : t.status === "cold"
                    ? "text-red-400 font-bold"
                    : "text-slate-400"
                }
              >
                {t.status === "hot"
                  ? "🔥 Hot"
                  : t.status === "cold"
                  ? "🧊 Cold"
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
