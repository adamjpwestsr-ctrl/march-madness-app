"use client";

import { useState, useEffect } from "react";
import PicksGameCard from "./PicksGameCard";

export default function PicksShell({
  games,
  userId,
  seasonYear,
  week,
  lockTime,
}: {
  games: any[];
  userId: string | null;
  seasonYear: number;
  week: number;
  lockTime: string | null;
}) {
  const [now, setNow] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);
  const [picks, setPicks] = useState<Record<string, string>>({}); // game_id -> team_id

  const locked =
    lockTime ? new Date(lockTime).getTime() <= now.getTime() : false;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  function handlePick(gameId: string, teamId: string) {
    if (locked) return;
    setPicks((prev) => ({ ...prev, [gameId]: teamId }));
  }

  async function handleSave() {
    if (!userId) return;
    if (locked) return;

    setSaving(true);

    try {
      const res = await fetch("/api/ncaaf/picks/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          seasonYear,
          week,
          picks,
        }),
      });

      if (!res.ok) {
        console.error("Failed to save picks");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Picks</h2>
        <button
          onClick={handleSave}
          disabled={locked || saving || !userId}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            locked || saving || !userId
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-yellow-500 text-black hover:bg-yellow-400"
          }`}
        >
          {locked
            ? "Locked"
            : saving
            ? "Saving..."
            : userId
            ? "Save Picks"
            : "Sign in to pick"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <PicksGameCard
            key={g.game_id}
            game={g}
            pickedTeamId={picks[g.game_id]}
            onPick={handlePick}
            locked={locked}
          />
        ))}
      </div>
    </div>
  );
}
