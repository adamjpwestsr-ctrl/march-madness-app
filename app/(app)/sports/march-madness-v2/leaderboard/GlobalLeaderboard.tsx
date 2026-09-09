"use client";

import React from "react";
import LeaderboardPanel from "./LeaderboardPanel";

export type GlobalLeaderboardEntry = {
  userId: string;
  name: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  groups: string[]; // list of groups the user belongs to
};

export default function GlobalLeaderboard({
  seasonYear,
  entries,
}: {
  seasonYear: number;
  entries: GlobalLeaderboardEntry[];
}) {
  return (
    <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-8 shadow-2xl backdrop-blur-md">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-yellow-400 tracking-tight drop-shadow-lg">
            Global Leaderboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Season {seasonYear} • All groups combined
          </p>
        </div>

        {/* SUMMARY */}
        <div className="flex items-center gap-6 text-sm text-slate-300">
          <div className="flex flex-col text-right">
            <span className="font-semibold text-slate-200">
              {entries.length}
            </span>
            <span className="text-slate-500">Players</span>
          </div>
        </div>
      </div>

      {/* LEADERBOARD */}
      <LeaderboardPanel entries={entries} />

      {/* FOOTER */}
      <div className="text-center text-slate-500 text-xs mt-6">
        Rankings updated hourly • Includes all public & private groups
      </div>
    </div>
  );
}
