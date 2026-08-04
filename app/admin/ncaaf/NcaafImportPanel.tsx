"use client";

import { useState } from "react";
import { Goal } from "lucide-react";

export default async function NcaafImportPanel() {
  const [gameId, setGameId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [winnerTeamId, setWinnerTeamId] = useState("");
  const [season, setSeason] = useState("");
  const [week, setWeek] = useState("");
  const [status, setStatus] = useState("");

  async function handleImportResult() {
    try {
      setStatus("Importing result...");
      const res = await fetch("/api/ncaaf/results/import", {
        method: "POST",
        body: JSON.stringify({
          game_id: Number(gameId),
          home_score: Number(homeScore),
          away_score: Number(awayScore),
          winner_team_id: winnerTeamId,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        console.error(data.error);
        setStatus("Error importing result");
        return;
      }
      setStatus("Result imported!");
    } catch (err) {
      console.error(err);
      setStatus("Unexpected error importing result");
    }
  }

  async function handleCalculatePoints() {
    try {
      setStatus("Calculating points...");
      const res = await fetch("/api/ncaaf/points/calculate", {
        method: "POST",
        body: JSON.stringify({
          season: Number(season),
          week: Number(week),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        console.error(data.error);
        setStatus("Error calculating points");
        return;
      }
      setStatus("Points calculated!");
    } catch (err) {
      console.error(err);
      setStatus("Unexpected error calculating points");
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Goal size={18} className="text-emerald-400" />
        Results & Points
      </h2>

      <p className="text-slate-400 text-sm">
        Import final scores and calculate weekly points for NCAA Football.
      </p>

      {/* Import Result */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Import Game Result</h3>

        <div className="grid grid-cols-2 gap-2">
          <input
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Game ID (ncaaf_games.id)"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
          />
          <input
            value={winnerTeamId}
            onChange={(e) => setWinnerTeamId(e.target.value)}
            placeholder="Winner Team ID"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
          />
          <input
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="Home Score"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
          />
          <input
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="Away Score"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
          />
        </div>

        <button
          onClick={handleImportResult}
          className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-sm font-semibold text-slate-900"
        >
          Import Result
        </button>
      </div>

      {/* Calculate Points */}
      <div className="space-y-2 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200">Calculate Weekly Points</h3>

        <div className="grid grid-cols-2 gap-2">
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Season (e.g. 2025)"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
          />
          <input
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            placeholder="Week (e.g. 1)"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
          />
        </div>

        <button
          onClick={handleCalculatePoints}
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold text-slate-900"
        >
          Calculate Points
        </button>
      </div>

      {status && <p className="text-slate-300 text-sm mt-2">{status}</p>}
    </section>
  );
}
