"use client";

import { useState, useEffect } from "react";

interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

interface Player {
  id: number;
  name: string;
  photo_url?: string | null;
}

interface ResultRow {
  player_id: number;
  final_score_relative_to_par: number;
}

export default function AdminGolfWeeklyClient({
  tournaments,
  players,
}: {
  tournaments: Tournament[];
  players: Player[];
}) {
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(
    tournaments[0]?.id ?? null
  );

  const [results, setResults] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [awarded, setAwarded] = useState<any[]>([]);

  // Load existing results
  useEffect(() => {
    if (!selectedTournamentId) return;

    fetch(`/sports/golf/weekly/results?tournament_id=${selectedTournamentId}`)
      .then((res) => res.json())
      .then((data) => {
        const map: Record<number, number> = {};
        (data.results || []).forEach((r: ResultRow) => {
          map[r.player_id] = r.final_score_relative_to_par;
        });
        setResults(map);
        setAwarded(data.awarded || []);
      });
  }, [selectedTournamentId]);

  const updateScore = (playerId: number, value: string) => {
    const num = parseInt(value, 10);
    setResults((prev) => ({
      ...prev,
      [playerId]: isNaN(num) ? 0 : num,
    }));
  };

  const saveScores = async () => {
    if (!selectedTournamentId) return;

    setLoading(true);
    try {
      const res = await fetch("/sports/golf/weekly/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: selectedTournamentId,
          results,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Error saving results");
      } else {
        alert("Scores saved");
      }
    } finally {
      setLoading(false);
    }
  };

  const runScoring = async () => {
    if (!selectedTournamentId) return;

    setScoring(true);
    try {
      const res = await fetch("/sports/golf/weekly/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournament_id: selectedTournamentId }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Error awarding points");
      } else {
        alert("Scoring complete");
      }
    } finally {
      setScoring(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 flex flex-col gap-10">
      <h1 className="text-3xl font-bold text-center">Golf Weekly Admin</h1>

      {/* Tournament selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {tournaments.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTournamentId(t.id)}
            className={`
              px-4 py-2 rounded-sm border text-sm
              ${
                selectedTournamentId === t.id
                  ? "bg-emerald-600 border-emerald-400"
                  : "bg-slate-900 border-slate-700 hover:border-emerald-500"
              }
            `}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Player score entry */}
      <div className="max-w-3xl mx-auto bg-slate-900/40 border border-slate-700/60 rounded-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Enter Final Scores</h2>

        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center border-b border-slate-800 pb-2"
            >
              <span>{p.name}</span>
              <input
                type="number"
                className="w-20 bg-slate-800 border border-slate-700 rounded-sm px-2 py-1 text-right"
                value={results[p.id] ?? ""}
                onChange={(e) => updateScore(p.id, e.target.value)}
                placeholder="E.g. -14"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={saveScores}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-sm font-semibold disabled:bg-slate-700"
          >
            {loading ? "Saving..." : "Save Scores"}
          </button>
        </div>
      </div>

      {/* Scoring */}
      <div className="flex justify-center">
        <button
          onClick={runScoring}
          disabled={scoring}
          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-sm font-semibold disabled:bg-slate-700"
        >
          {scoring ? "Scoring..." : "Award Points"}
        </button>
      </div>

      {/* Awarded points */}
      {awarded.length > 0 && (
        <div className="max-w-xl mx-auto bg-slate-900/40 border border-slate-700/60 rounded-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Points Awarded</h2>
          <div className="flex flex-col gap-2">
            {awarded.map((row) => (
              <div
                key={row.user_id}
                className="flex justify-between border-b border-slate-800 pb-1"
              >
                <span>{row.name}</span>
                <span className="text-emerald-400 font-bold">
                  {row.points_awarded}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
