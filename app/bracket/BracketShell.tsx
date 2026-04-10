"use client";

import { useEffect, useState } from "react";
import BracketClient from "./BracketClient";

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
  winner: string | null;
  source_game1: number | null;
  source_game2: number | null;
};

type BracketData = {
  bracket: { bracket_id: string };
  picks: Pick[];
  games: Game[];
};

export default function BracketShell({
  bracketId,
  bracketName,
}: {
  bracketId: string;
  bracketName: string;
}) {
  const [bracketData, setBracketData] = useState<BracketData | null>(null);
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

  const handlePick = (gameId: number, teamId: string) => {
    setBracketData((prev) => {
      if (!prev) return prev;

      const newPicks: Pick[] = [
        ...prev.picks.filter((p) => p.game_id !== gameId),
        { bracket_id: bracketId, game_id: gameId, selected_team: teamId },
      ];

      return { ...prev, picks: newPicks };
    });

    fetch("/api/pick", {
      method: "POST",
      body: JSON.stringify({ bracketId, gameId, teamId }),
      headers: { "Content-Type": "application/json" },
    });

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
