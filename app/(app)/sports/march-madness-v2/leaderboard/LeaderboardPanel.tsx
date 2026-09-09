"use client";

import React, { useMemo, useState, useEffect } from "react";
import LeaderboardRow from "./LeaderboardRow";

export default function LeaderboardPanel({
  entries,
}: {
  entries: {
    userId: string;
    name: string;
    avatarUrl?: string;
    score: number;
    rank: number;
    previousRank?: number;
    previousScore?: number;
  }[];
}) {
  const [spotlight, setSpotlight] = useState(false);
  const [lastLeader, setLastLeader] = useState<string | null>(null);

  const enrichedEntries = useMemo(() => {
    return entries.map((entry) => {
      const previousRank = entry.previousRank ?? entry.rank;
      const rankChange = previousRank - entry.rank;

      const previousScore = entry.previousScore ?? entry.score;
      const momentum = entry.score - previousScore;

      return { ...entry, rankChange, momentum };
    });
  }, [entries]);

  useEffect(() => {
    const currentLeader = enrichedEntries.find((e) => e.rank === 1)?.userId;

    if (currentLeader && currentLeader !== lastLeader) {
      setLastLeader(currentLeader);
      setSpotlight(true);

      const timer = setTimeout(() => setSpotlight(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [enrichedEntries, lastLeader]);

  return (
    <div className="rounded-xl bg-slate-900/60 border border-white/10 p-8 shadow-xl backdrop-blur-md">
      <h2 className="text-3xl font-extrabold text-yellow-400 tracking-tight text-center mb-6 drop-shadow-lg">
        Leaderboard
      </h2>

      <div className="flex flex-col gap-4">
        {enrichedEntries.length === 0 && (
          <p className="text-center text-slate-400">No entries yet.</p>
        )}

        {enrichedEntries.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            spotlight={spotlight}
          />
        ))}
      </div>
    </div>
  );
}
