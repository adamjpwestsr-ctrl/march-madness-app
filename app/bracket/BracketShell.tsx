"use client";

import { useEffect, useState } from "react";
import BracketClient from "./BracketClient";
import { submitBracket } from "./actions"; // ⭐ ADD THIS IMPORT

// -----------------------------
// Types matching your API shape
// -----------------------------
type Pick = {
  bracket_id: string;
  game_id: number;
  selected_team: string;
};

type Team = {
  team_id: string;
  name: string;
  seed: number | null;
};

type Game = {
  game_id: number;
  round: number;
  region: string;
  team1: Team | null;
  team2: Team | null;
  winner_team_id: string | null;
  source_game1: number | null;
  source_game2: number | null;
};

type BracketData = {
  bracket: { bracket_id: string };
  picks: Pick[];
  games: Game[];
};

// -----------------------------
// Component
// -----------------------------
export default function BracketShell({
  bracketId,
  bracketName,
}: {
  bracketId: string;
  bracketName: string;
}) {
  const [bracketData, setBracketData] = useState<BracketData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load bracket from API
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

  // -----------------------------
  // Optimistic pick update (no flicker)
  // -----------------------------
  const handlePick = (gameId: number, teamId: string) => {
    setBracketData((prev) => {
      if (!prev) return prev;

      const newPicks: Pick[] = [
        ...prev.picks.filter((p) => p.game_id !== gameId),
        { bracket_id: bracketId, game_id: gameId, selected_team: teamId },
      ];

      return { ...prev, picks: newPicks };
    });

    // Fire request (non-blocking)
    fetch("/api/pick", {
      method: "POST",
      body: JSON.stringify({ bracketId, gameId, teamId }),
      headers: { "Content-Type": "application/json" },
    });

    // Background refresh (no flicker)
    setTimeout(loadBracket, 50);
  };

  // -----------------------------
  // Reset bracket
  // -----------------------------
  const handleReset = async () => {
    await fetch("/api/bracket/reset", {
      method: "POST",
      body: JSON.stringify({ bracketId }),
      headers: { "Content-Type": "application/json" },
    });

    loadBracket();
  };

  // -----------------------------
  // Render
  // -----------------------------
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

      {/* ----------------------------- */}
      {/* ⭐ SUBMIT BRACKET SECTION     */}
      {/* ----------------------------- */}
      <form
        action={submitBracket}
        className="mt-8 flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700"
      >
        <input type="hidden" name="bracketId" value={bracketId} />

        <div className="flex flex-col">
          <label className="text-sm text-slate-300 mb-1">Tiebreaker</label>
          <input
            type="number"
            name="tiebreaker"
            placeholder="Total points in championship game"
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 w-64"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold shadow-lg"
        >
          Submit Bracket
        </button>
      </form>
    </div>
  );
}
