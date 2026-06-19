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
      try {
        const res = await fetch(`/api/mlb/weekly/state?week=${week}`);
        const json = await res.json();
        setSeries(json.series || []);
      } catch (err) {
        console.error("Error fetching series:", err);
        setSeries([]);
      }
    })();
  }, [week]);

  const setWinner = async (s: any, winnerTeamId: number | null) => {
    try {
      const res = await fetch("/api/admin/mlb/set-winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_id: s.series_id,
          winner_team_id: winnerTeamId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update winner");

      // Update local state so UI reflects selection immediately
      setSeries((prev) =>
        prev.map((item) =>
          item.series_id === s.series_id
            ? {
                ...item,
                winner_team_id: winnerTeamId,
                is_draw: winnerTeamId === null,
              }
            : item
        )
      );

      if (winnerTeamId === null) {
        setToast(`Draw selected for ${s.home_abbrev} vs ${s.away_abbrev}`);
      } else if (winnerTeamId === s.home_team_id) {
        setToast(`${s.home_name} marked as winner`);
      } else if (winnerTeamId === s.away_team_id) {
        setToast(`${s.away_name} marked as winner`);
      } else {
        setToast("Winner updated");
      }

      setTimeout(() => setToast(null), 2500);
    } catch (err: any) {
      setToast(err.message || "Error updating winner");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const scoreWeek = async () => {
    if (!week) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mlb/score-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_number: week }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to score week");

      setToast("Week scored successfully");
      setTimeout(() => setToast(null), 2500);
    } catch (err: any) {
      setToast(err.message || "Error scoring week");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8 flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">MLB Admin — Weekly Tools</h1>

      {/* Top: Week Selector */}
      <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Select Week</h2>
        <div className="flex flex-wrap gap-2">
          {[...Array(26)].map((_, i) => (
            <button
              key={i}
              onClick={() => setWeek(i + 1)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                week === i + 1
                  ? "bg-emerald-600 border-emerald-400 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Week {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Series + Admin Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Series List (2 columns on large screens) */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">
              {week ? `Week ${week} Series` : "Select a week to view series"}
            </h2>
            {week && (
              <button
                onClick={scoreWeek}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  loading
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                }`}
              >
                {loading ? "Scoring..." : "Score Week"}
              </button>
            )}
          </div>

          {!week ? (
            <p className="text-slate-400 text-sm">
              Choose a week above to load its series.
            </p>
          ) : series.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No series found for this week.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {series.map((s) => {
                const homeSelected = s.winner_team_id === s.home_team_id && !s.is_draw;
                const awaySelected = s.winner_team_id === s.away_team_id && !s.is_draw;
                const isDraw = s.is_draw;

                return (
                  <div
                    key={s.series_id}
                    className="flex flex-col gap-2 bg-slate-800/40 px-4 py-3 rounded-lg border border-slate-700/60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Teams */}
                      <div className="flex items-center gap-6">
                        {/* Home */}
                        <div
                          className={`flex items-center gap-3 px-2 py-1 rounded-lg transition-all duration-300 ${
                            homeSelected || isDraw
                              ? "ring-2 ring-emerald-500/80 bg-slate-900/70"
                              : "bg-slate-900/30"
                          }`}
                        >
                          <img
                            src={`/logos/mlb/${String(s.home_abbrev || "")
                              .toLowerCase()}.png`}
                            alt={s.home_name}
                            className="w-10 h-10 rounded-full object-contain"
                          />
                          <span className="text-slate-200 text-sm font-medium">
                            {s.home_name}
                          </span>
                        </div>

                        <span className="text-slate-400 text-xs">vs</span>

                        {/* Away */}
                        <div
                          className={`flex items-center gap-3 px-2 py-1 rounded-lg transition-all duration-300 ${
                            awaySelected || isDraw
                              ? "ring-2 ring-blue-500/80 bg-slate-900/70"
                              : "bg-slate-900/30"
                          }`}
                        >
                          <img
                            src={`/logos/mlb/${String(s.away_abbrev || "")
                              .toLowerCase()}.png`}
                            alt={s.away_name}
                            className="w-10 h-10 rounded-full object-contain"
                          />
                          <span className="text-slate-200 text-sm font-medium">
                            {s.away_name}
                          </span>
                        </div>
                      </div>

                      {/* Winner Buttons */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setWinner(s, s.home_team_id)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                              homeSelected && !isDraw
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/40"
                                : "bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-200"
                            }`}
                          >
                            Home Wins
                          </button>
                          <button
                            onClick={() => setWinner(s, s.away_team_id)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                              awaySelected && !isDraw
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/40"
                                : "bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-200"
                            }`}
                          >
                            Away Wins
                          </button>
                          <button
                            onClick={() => setWinner(s, null)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                              isDraw
                                ? "bg-yellow-500 text-slate-900 shadow-md shadow-yellow-400/40"
                                : "bg-slate-700 hover:bg-yellow-500 hover:text-slate-900 text-slate-200"
                            }`}
                          >
                            Draw
                          </button>
                        </div>

                        {/* Current status badge */}
                        <span className="text-[11px] text-slate-400">
                          {isDraw
                            ? "Result: Draw"
                            : homeSelected
                            ? `Result: ${s.home_abbrev} wins`
                            : awaySelected
                            ? `Result: ${s.away_abbrev} wins`
                            : "Result: Not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Tools Panel */}
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-1">Admin Tools</h2>
          <p className="text-slate-400 text-sm mb-2">
            Quick actions and context for the current MLB challenge week.
          </p>

          <button className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all">
            Export Weekly Results (CSV)
          </button>

          <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all">
            View MLB Leaderboard
          </button>

          <button className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-all">
            Open MLB History
          </button>

          <div className="mt-4 border-t border-slate-800 pt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Current Week</span>
              <span className="text-slate-100 text-sm font-semibold">
                {week ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Series Loaded</span>
              <span className="text-slate-100 text-sm font-semibold">
                {week ? series.length : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

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

