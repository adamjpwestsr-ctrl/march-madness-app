"use client";

import { useEffect, useState } from "react";

interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  category: string | null;
  is_premium_event: boolean | null;
}

interface Player {
  id: number;
  name: string;
  country?: string | null;
  photo_url?: string | null;
}

interface UserPick {
  tournament_id: number;
  player_id: number;
}

interface GolfWeeklyClientProps {
  tournaments: Tournament[];
  players: Player[];
}

export default function GolfWeeklyClient({
  tournaments,
  players,
}: GolfWeeklyClientProps) {
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(
    tournaments[0]?.id ?? null
  );
  const [pickedPlayerId, setPickedPlayerId] = useState<number | null>(null);
  const [userPicks, setUserPicks] = useState<UserPick[]>([]);
  const [loadingPick, setLoadingPick] = useState(false);

  useEffect(() => {
    fetch("/sports/golf/weekly/state")
      .then((res) => res.json())
      .then((data) => {
        setUserPicks(data.picks || []);
        if (selectedTournamentId) {
          const existing = (data.picks || []).find(
            (p: UserPick) => p.tournament_id === selectedTournamentId
          );
          setPickedPlayerId(existing?.player_id ?? null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTournamentId) return;
    const existing = userPicks.find(
      (p) => p.tournament_id === selectedTournamentId
    );
    setPickedPlayerId(existing?.player_id ?? null);
  }, [selectedTournamentId, userPicks]);

  const pickedPlayerIds = new Set(userPicks.map((p) => p.player_id));

  const currentTournament = tournaments.find(
    (t) => t.id === selectedTournamentId
  );

  const handlePick = async () => {
    if (!selectedTournamentId || !pickedPlayerId) return;

    setLoadingPick(true);
    try {
      const res = await fetch("/sports/golf/weekly/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: selectedTournamentId,
          player_id: pickedPlayerId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Error saving pick");
        return;
      }

      setUserPicks((prev) => [
        ...prev.filter((p) => p.tournament_id !== selectedTournamentId),
        { tournament_id: selectedTournamentId, player_id: pickedPlayerId },
      ]);
    } finally {
      setLoadingPick(false);
    }
  };

  const premiumLabel = (t: Tournament) => {
    if (!t.is_premium_event) return null;
    if (t.category === "major") return "Major";
    if (t.category === "signature") return "Signature";
    if (t.category === "fedex") return "FedEx Cup";
    return "Premium";
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Golf Weekly Picks</h1>
        <p className="text-slate-400 text-sm">
          Pick one player per tournament. You can only pick each player once per
          season.
        </p>
      </div>

      {/* Tournament selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {tournaments.map((t) => {
          const isSelected = selectedTournamentId === t.id;
          const label = premiumLabel(t);

          return (
            <button
              key={t.id}
              onClick={() => setSelectedTournamentId(t.id)}
              className={`
                px-4 py-2 rounded-sm border text-xs md:text-sm flex items-center gap-2
                ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-400"
                    : "bg-slate-900 border-slate-700 hover:border-emerald-500"
                }
              `}
            >
              <span>{t.name}</span>
              {label && (
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/40">
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current tournament info */}
      {currentTournament && (
        <div className="text-center text-slate-400 text-xs">
          <span>
            {new Date(currentTournament.start_date).toLocaleDateString()} –{" "}
            {new Date(currentTournament.end_date).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Player grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
        {players.map((player) => {
          const alreadyUsed = pickedPlayerIds.has(player.id);
          const isSelected = pickedPlayerId === player.id;

          return (
            <button
              key={player.id}
              disabled={alreadyUsed && !isSelected}
              onClick={() => setPickedPlayerId(player.id)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-sm border text-xs
                ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-400"
                    : alreadyUsed
                    ? "bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed"
                    : "bg-slate-900 border-slate-700 hover:border-emerald-500"
                }
              `}
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <span className="text-center">{player.name}</span>
            </button>
          );
        })}
      </div>

      {/* Save button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handlePick}
          disabled={!selectedTournamentId || !pickedPlayerId || loadingPick}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-sm font-semibold"
        >
          {loadingPick ? "Saving..." : "Save Pick"}
        </button>
      </div>
    </div>
  );
}
