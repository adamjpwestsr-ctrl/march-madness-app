"use client";

import { useState } from "react";
import { injectOpeningRoundWinner } from "@/actions/injectOpeningRoundWinner";

export function OpeningRoundAdmin({ game }) {
  const [loading, setLoading] = useState(false);

  async function handleWinner(teamId: string) {
    setLoading(true);
    await injectOpeningRoundWinner(game.id, teamId);
    setLoading(false);
  }

  return (
    <div className="p-4 border rounded-lg bg-slate-800/40">
      <h2 className="text-xl font-semibold mb-2">
        Opening Round Game {game.gameNumber}
      </h2>

      <button
        disabled={loading}
        onClick={() => handleWinner(game.team1Id)}
        className="block w-full p-3 mb-2 bg-blue-600 rounded-lg"
      >
        Select Winner: {game.team1Name}
      </button>

      <button
        disabled={loading}
        onClick={() => handleWinner(game.team2Id)}
        className="block w-full p-3 bg-blue-600 rounded-lg"
      >
        Select Winner: {game.team2Name}
      </button>
    </div>
  );
}
