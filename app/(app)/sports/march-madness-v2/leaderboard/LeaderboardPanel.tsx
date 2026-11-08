
"use client";

import { memo } from "react";
import LeaderboardRow from "./LeaderboardRow";

export type LeaderboardEntry = {
  bracketId: string;
  userId: string;
  rank: number;
  rankChange: number;
  momentum: number;
  name: string;
  avatarUrl: string;
  score: number;
  groups: string[];
};

type LeaderboardPanelProps = {
  leaderboard: LeaderboardEntry[];
};

function LeaderboardPanel({ leaderboard }: LeaderboardPanelProps) {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-white/10 p-8 shadow-xl backdrop-blur-md">
      <h2 className="text-3xl font-extrabold text-yellow-400 tracking-tight text-center mb-6 drop-shadow-lg">
        Leaderboard
      </h2>

      <div className="flex flex-col gap-4">
        {leaderboard.length === 0 && (
          <p className="text-center text-slate-400">No entries yet.</p>
        )}

        {leaderboard.map((entry) => (
          <LeaderboardRow key={entry.bracketId} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export default memo(LeaderboardPanel);
