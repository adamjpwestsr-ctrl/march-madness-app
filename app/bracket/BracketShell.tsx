"use client";

import { useEffect, useState } from "react";
import BracketClient from "./BracketClient";

export default function BracketShell({ bracketId, bracketName }) {
  const [bracketData, setBracketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBracket = async () => {
    try {
      const res = await fetch(`/api/bracket?bracketId=${bracketId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setBracketData(json);
    } catch (err) {
      console.error("Bracket load error:", err);
      setError("Failed to load bracket.");
    }
  };

  useEffect(() => {
    loadBracket();
  }, [bracketId]);

  // ⭐ Optimistic pick update with NO flicker
  const handlePick = (gameId: number, teamId: string) => {
    // 1. Optimistic UI
    setBracketData((prev) => {
      if (!prev) return prev;

      const newPicks = [
        ...prev.picks.filter((p) => p.game_id !== gameId),
        { bracket_id: bracketId, game_id: gameId, selected_team: teamId },
      ];

      return { ...prev, picks: newPicks };
    });

    // 2. Fire request (non-blocking)
    fetch("/api/pick", {
      method: "POST",
      body: JSON.stringify({ bracketId, gameId, teamId }),
      headers: { "Content-Type": "application/json" },
    });

    // 3. Background refresh (NO flicker)
    setTimeout(loadBracket, 50);
  };

  const handleReset = async () => {
    await fetch("/api/bracket/reset", {
      method: "POST",
      body: JSON.stringify({ bracketId }),
      headers: { "Content-Type": "application/json" },
    });

    loadBracket();
  };

  if (!bracketData) {
    return <div className="text-slate-300 text-lg">Loading bracket…</div>;
  }

  const { bracket, picks, games } = bracketData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold mb-4">{bracketName}</h2>

      <BracketClient
        bracket={bracket}
        picks={picks}
        games={games}
        onPick={handlePick}
        onReset={handleReset}
      />
    </div>
  );
}
