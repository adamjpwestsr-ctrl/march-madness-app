"use client";

import { useEffect, useState } from "react";

interface LeaderboardRow {
  user_id: number;
  name: string;
  email: string;
  points: number;
}

interface Tournament {
  id: number;
  name: string;
}

export default function GolfWeeklyLeaderboard() {
  const [tab, setTab] = useState<"season" | "premium" | "tournament">("season");
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(
    null
  );

  const loadSeason = () => {
    fetch("/sports/golf/weekly/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []));
  };

  const loadPremium = () => {
    fetch("/sports/golf/weekly/leaderboard/premium")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []));
  };

  const loadTournaments = () => {
    fetch("/sports/golf/weekly/state")
      .then((res) => res.json())
      .then((data) => setTournaments(data.tournaments || []));
  };

  const loadTournamentLeaderboard = (id: number) => {
    fetch(`/sports/golf/weekly/leaderboard/tournament?tournament_id=${id}`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []));
  };

  useEffect(() => {
    loadSeason();
    loadTournaments();
  }, []);

  useEffect(() => {
    if (tab === "season") loadSeason();
    if (tab === "premium") loadPremium();
    if (tab === "tournament" && selectedTournamentId)
      loadTournamentLeaderboard(selectedTournamentId);
  }, [tab, selectedTournamentId]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 flex flex-col gap-10">
      <h1 className="text-3xl font-bold text-center">Golf Weekly Leaderboard</h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        {[
          { key: "season", label: "Season" },
          { key: "premium", label: "Premium Events" },
          { key: "tournament", label: "By Tournament" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`
              px-4 py-2 rounded-sm border text-sm
              ${
                tab === t.key
                  ? "bg-emerald-600 border-emerald-400"
                  : "bg-slate-900 border-slate-700 hover:border-emerald-500"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tournament selector */}
      {tab === "tournament" && (
        <div className="flex flex-wrap gap-3 justify-center">
          {tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTournamentId(t.id)}
              className={`
                px-4 py-2 rounded-sm border text-xs
                ${
                  selectedTournamentId === t.id
                    ? "bg-blue-600 border-blue-400"
                    : "bg-slate-900 border-slate-700 hover:border-blue-500"
                }
              `}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <div className="max-w-xl mx-auto bg-slate-900/40 border border-slate-700/60 rounded-sm p-6">
        <div className="flex flex-col gap-3">
          {leaderboard.map((row, idx) => (
            <div
              key={row.user_id}
              className="flex justify-between items-center bg-white/5 border border-slate-700/60 rounded-sm px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 w-6 text-right">{idx + 1}</span>
                <span className="font-medium">{row.name}</span>
              </div>
              <span className="font-bold text-emerald-400">{row.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
