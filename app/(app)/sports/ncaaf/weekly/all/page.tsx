"use client";

import { useEffect, useState } from "react";
import NcaafGameCard from "@/app/components/ncaaf/NcaafGameCard";
import { submitPick } from "@/app/components/ncaaf/submitPick";

export default function NcaafAllMatchups() {
  const [games, setGames] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/ncaaf/ticker");
      const data = await res.json();
      setGames(data.events || []);
    }
    load();
  }, []);

  async function handlePick(gameId: string, teamId: string) {
    setStatus("Saving pick...");
    const userId = localStorage.getItem("user_id")!;
await submitPick({
  userId,
  gameId,
  pickTeamId: teamId,
  season: currentSeason,   // whatever your season variable is
  week: currentWeek,       // whatever your week variable is
});
    setStatus("Pick saved!");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">All Matchups</h1>

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
