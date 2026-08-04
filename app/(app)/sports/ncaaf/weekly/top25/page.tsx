"use client";

import { useEffect, useState } from "react";
import NcaafGameCard from "@/app/components/ncaaf/NcaafGameCard";
import { submitPick } from "@/app/components/ncaaf/submitPick";

const currentSeason = 2024;
const currentWeek = 1;

export default async function NcaafTop25Matchups() {
  const [games, setGames] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/ncaaf/ticker");
      const data = await res.json();

      const filtered = (data.events || []).filter(
        (g: any) => g.home_rank || g.away_rank
      );

      setGames(filtered);
    }
    load();
  }, []);

  async function handlePick(gameId: string, teamId: string) {
    setStatus("Saving pick...");

    const userId = Number(localStorage.getItem("user_id"));
    const numericGameId = Number(gameId);

    await submitPick({
      userId,
      gameId: numericGameId,
      pickTeamId: teamId,
      season: currentSeason,
      week: currentWeek,
    });

    setStatus("Pick saved!");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Top 25 Matchups</h1>

      <div className="grid gap-4">
        {games.map((g) => (
          <NcaafGameCard
            key={g.id}
            game={g}
            onPick={(teamId) => handlePick(g.id, teamId)}
          />
        ))}
      </div>

      {status && <p className="text-slate-300">{status}</p>}
    </div>
  );
}
