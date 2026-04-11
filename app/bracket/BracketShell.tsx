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

  // -----------------------------
  // PREMIUM LOADING STATE
  // -----------------------------
  if (!bracketData && !error) {
    return (
      <div
        className="
          w-full max-w-3xl mx-auto mt-6
          p-8 rounded-2xl
          bg-white/5 border border-white/10 backdrop-blur-md
          shadow-xl shadow-black/40
          animate-pulse
          text-center text-slate-300
        "
      >
        Loading bracket…
      </div>
    );
  }

  // -----------------------------
  // PREMIUM ERROR STATE
  // -----------------------------
  if (error) {
    return (
      <div
        className="
          w-full max-w-3xl mx-auto mt-6
          p-6 rounded-xl
          bg-red-900/40 border border-red-700/40 backdrop-blur-md
          shadow-lg shadow-black/40
          text-red-200 text-center
        "
      >
        {error}
      </div>
    );
  }

  const { bracket, picks, games } = bracketData!;

  // -----------------------------
  // PREMIUM BRACKET CONTAINER
  // -----------------------------
  return (
    <div
      className="
        w-full max-w-4xl mx-auto mt-6
        p-8 rounded-3xl
        bg-white/5 border border-white/10 backdrop-blur-xl
        shadow-2xl shadow-black/50
        relative overflow-hidden
      "
    >
      {/* Spotlight */}
      <div className="absolute inset-0 bg-gradient-radial from-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-semibold tracking-wide text-slate-100">
          {bracketName}
        </h2>
        <div className="h-[3px] w-24 mt-2 rounded-full bg-emerald-500" />
      </div>

      {/* Bracket Client */}
      <div className="relative z-10">
        <BracketClient
          bracket={bracket}
          picks={picks}
          games={games}
          onPick={handlePick}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
