"use client";

import { useEffect, useState } from "react";

type Tournament = { id: number; name: string };
type Player = { id: number; name: string };

export default function GolfScoreEntryPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [projectedPoints, setProjectedPoints] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      const [tRes, pRes] = await Promise.all([
        fetch("/api/admin/golf/tournaments"),
        fetch("/api/admin/golf/players"),
      ]);

      const tJson = await tRes.json();
      const pJson = await pRes.json();

      setTournaments(tJson.tournaments || []);
      setPlayers(pJson.players || []);
    };

    loadData();
  }, []);

  useEffect(() => {
    let base =
      score < 0 ? Math.abs(score) : score === 0 ? 1 : 0;
    if (isWinner) base += 10;
    setProjectedPoints(base);
  }, [score, isWinner]);

  const handleSaveResult = async () => {
    if (!tournamentId || !playerId) {
      setStatus("Select tournament and player first.");
      return;
    }

    setStatus("Saving...");
    const res = await fetch("/api/admin/golf/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournament_id: tournamentId,
        player_id: playerId,
        final_score_relative_to_par: score,
        is_winner: isWinner,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setStatus(`Error: ${json.error}`);
    } else {
      setStatus("Result saved.");
    }
  };

  const handleRunScoring = async () => {
    if (!tournamentId) {
      setStatus("Select a tournament first.");
      return;
    }

    setStatus("Scoring...");
    const res = await fetch("/api/admin/golf/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournament_id: tournamentId }),
    });

    const json = await res.json();
    if (!res.ok) {
      setStatus(`Error: ${json.error}`);
    } else {
      setStatus("Scoring completed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Golf Weekly — Score Entry</h1>

      <div className="grid gap-4 max-w-xl">
        <div>
          <label className="block mb-1 text-sm">Tournament</label>
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            value={tournamentId ?? ""}
            onChange={(e) => setTournamentId(Number(e.target.value) || null)}
          >
            <option value="">Select tournament...</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Player</label>
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            value={playerId ?? ""}
            onChange={(e) => setPlayerId(Number(e.target.value) || null)}
          >
            <option value="">Select player...</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Final score relative to par</label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="winner"
            type="checkbox"
            checked={isWinner}
            onChange={(e) => setIsWinner(e.target.checked)}
          />
          <label htmlFor="winner" className="text-sm">
            Mark as tournament winner (+10 points)
          </label>
        </div>

        <div>
          <span className="text-sm">Projected points:</span>{" "}
          <span className="font-bold">{projectedPoints}</span>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSaveResult}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500"
          >
            Save Result
          </button>
          <button
            onClick={handleRunScoring}
            className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500"
          >
            Run Scoring for Tournament
          </button>
        </div>

        {status && <p className="mt-2 text-sm text-slate-300">{status}</p>}
      </div>
    </div>
  );
}
