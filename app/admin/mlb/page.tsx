"use client";

import { useEffect, useState } from "react";

export default function MLBAdminPage() {
  const [week, setWeek] = useState<number | null>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Fetch series for selected week
  useEffect(() => {
    if (!week) return;
    (async () => {
      const res = await fetch(`/app/api/mlb/weekly/state?week=${week}`);
      const json = await res.json();
      setSeries(json.series || []);
    })();
  }, [week]);

  const setWinner = async (seriesId: number, winnerTeamId: number | null) => {
    try {
      const res = await fetch("/app/api/admin/mlb/set-winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_id: seriesId,
          winner_team_id: winnerTeamId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setToast("Winner updated");
    } catch (err: any) {
      setToast(err.message);
    }
  };

  const scoreWeek = async () => {
    if (!week) return;
    setLoading(true);
    try {
      const res = await fetch("/app/api/admin/mlb/score-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_number: week }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setToast("Week scored successfully");
    } catch (err: any) {
      setToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">MLB Admin — Weekly Tools</h1>

      {/* Week Selector */}
      <div className="flex flex-wrap gap-2">
        {[...Array(26)].map((_, i) => (
          <button
            key={i}
            onClick={() => setWeek(i + 1)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
              week === i + 1
                ? "bg-emerald-600 border-emerald-400 text-white"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Week {i + 1}
          </button>
        ))}
      </div>

      {/* Series List */}
      {week && (
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Week {week} Series</h2>

          <div className="flex flex-col gap-4">
            {series.map((s) => (
              <div
                key={s.series_id}
                className="flex items-center justify-between bg-slate-800/40 px-4 py-3 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`/logos/mlb/${s.home_abbrev}.png`}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-slate-300">{s.home_name}</span>

                  <span className="text-slate-400 text-sm">vs</span>

                  <img
                    src={`/logos/mlb/${s.away_abbrev}.png`}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-slate-300">{s.away_name}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setWinner(s.series_id, s.home_team_id)}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
                  >
                    Home Wins
                  </button>
                  <button
                    onClick={() => setWinner(s.series_id, s.away_team_id)}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
                  >
                    Away Wins
                  </button>
                  <button
                    onClick={() => setWinner(s.series_id, null)}
                    className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm"
                  >
                    Draw
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Score Week Button */}
          <button
            onClick={scoreWeek}
            disabled={loading}
            className={`mt-6 w-full py-3 rounded-lg font-semibold text-sm transition-all ${
              loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
            }`}
          >
            {loading ? "Scoring..." : "Score Week"}
          </button>
        </div>
      )}

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
