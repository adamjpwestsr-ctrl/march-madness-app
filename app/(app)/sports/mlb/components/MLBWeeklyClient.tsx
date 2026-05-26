"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function MLBWeeklyClient({ week }: { week: number }) {
  const [series, setSeries] = useState<any[]>([]);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Fetch series for this week
  useEffect(() => {
    if (!week) return;
    (async () => {
      const res = await fetch(`/app/api/mlb/weekly/state?week=${week}`);
      const json = await res.json();
      setSeries(json.series || []);
    })();
  }, [week]);

  const handlePick = (seriesId: number, teamId: number) => {
    setPicks((prev) => ({ ...prev, [seriesId]: teamId }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/app/api/mlb/weekly/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_number: week,
          picks: Object.entries(picks).map(([seriesId, teamId]) => ({
            series_id: Number(seriesId),
            selected_team_id: Number(teamId),
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      setToast("Picks saved!");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      setToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {series.map((s) => (
          <div
            key={s.series_id}
            className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <img
                src={`/logos/mlb/${s.home_abbrev}.png`}
                alt={s.home_name}
                className={`w-12 h-12 cursor-pointer rounded-full ${
                  picks[s.series_id] === s.home_team_id
                    ? "ring-4 ring-emerald-500"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => handlePick(s.series_id, s.home_team_id)}
              />

              <span className="text-slate-400 text-sm">vs</span>

              <img
                src={`/logos/mlb/${s.away_abbrev}.png`}
                alt={s.away_name}
                className={`w-12 h-12 cursor-pointer rounded-full ${
                  picks[s.series_id] === s.away_team_id
                    ? "ring-4 ring-emerald-500"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => handlePick(s.series_id, s.away_team_id)}
              />
            </div>

            <div className="text-xs text-slate-400 text-center">
              {s.start_date} – {s.end_date} ({s.series_length} games)
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`mt-4 w-full py-3 rounded-lg font-semibold text-sm transition-all ${
          loading
            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
        }`}
      >
        {loading ? "Saving..." : "Save Picks"}
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-lg bg-slate-900/90 border border-white/10 shadow-xl text-sm text-white animate-fadeIn">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
