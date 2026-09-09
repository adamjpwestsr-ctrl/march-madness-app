"use client";

import React from "react";
import RoundColumn from "./RoundColumn";

export default function RegionPanel({
  title,
  regionId,
  matchups,
  onPick,
}: {
  title: string;
  regionId: string;
  matchups: {
    round64: any[];
    round32: any[];
    sweet16: any[];
    elite8: any[];
  };
  onPick: (gameId: string, teamId: string) => void;
}) {
  return (
    <div className="rounded-xl bg-slate-900/40 border border-white/10 p-6 shadow-lg backdrop-blur-sm">
      {/* REGION TITLE */}
      <h2 className="text-2xl font-bold text-yellow-400 tracking-tight mb-6 text-center drop-shadow">
        {title} Region
      </h2>

      {/* REGION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ROUND OF 64 */}
        <RoundColumn
          title="Round of 64"
          roundId={`${regionId}-64`}
          games={matchups.round64}
          onPick={onPick}
        />

        {/* ROUND OF 32 */}
        <RoundColumn
          title="Round of 32"
          roundId={`${regionId}-32`}
          games={matchups.round32}
          onPick={onPick}
        />

        {/* SWEET 16 */}
        <RoundColumn
          title="Sweet 16"
          roundId={`${regionId}-16`}
          games={matchups.sweet16}
          onPick={onPick}
        />

        {/* ELITE 8 */}
        <RoundColumn
          title="Elite 8"
          roundId={`${regionId}-8`}
          games={matchups.elite8}
          onPick={onPick}
        />
      </div>
    </div>
  );
}
