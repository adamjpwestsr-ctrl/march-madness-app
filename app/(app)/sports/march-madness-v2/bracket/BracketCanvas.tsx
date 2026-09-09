"use client";

import React from "react";
import RegionPanel from "./RegionPanel";
import FinalFourPanel from "./FinalFourPanel";
import ChampionshipPanel from "./ChampionshipPanel";

export default function BracketCanvas({
  bracket,
  onPick,
}: {
  bracket: any;            // full bracket structure (rounds, regions, matchups)
  onPick: (gameId: string, teamId: string) => void;
}) {
  return (
    <div className="w-full flex flex-col gap-10">
      {/* TITLE */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-yellow-400 drop-shadow-lg">
          March Madness Bracket
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Make your picks and advance your champion
        </p>
      </div>

      {/* FULL BRACKET GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE REGIONS */}
        <div className="flex flex-col gap-10">
          <RegionPanel
            title="East"
            regionId="east"
            matchups={bracket.regions.east}
            onPick={onPick}
          />

          <RegionPanel
            title="South"
            regionId="south"
            matchups={bracket.regions.south}
            onPick={onPick}
          />
        </div>

        {/* FINAL FOUR + CHAMPIONSHIP */}
        <div className="flex flex-col gap-10">
          <FinalFourPanel
            matchups={bracket.finalFour}
            onPick={onPick}
          />

          <ChampionshipPanel
            matchup={bracket.championship}
            onPick={onPick}
          />
        </div>

        {/* RIGHT SIDE REGIONS */}
        <div className="flex flex-col gap-10">
          <RegionPanel
            title="West"
            regionId="west"
            matchups={bracket.regions.west}
            onPick={onPick}
          />

          <RegionPanel
            title="Midwest"
            regionId="midwest"
            matchups={bracket.regions.midwest}
            onPick={onPick}
          />
        </div>
      </div>
    </div>
  );
}
