"use client";

import React from "react";
import RegionPanel from "./RegionPanel";
import FinalFourPanel from "./FinalFourPanel";
import ChampionshipPanel from "./ChampionshipPanel";

export default function BracketCanvas({
  bracket,
  onPick,
}: {
  bracket: any;
  onPick: (gameId: string, teamId: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[95vw] flex flex-col gap-10 px-4 lg:px-8">

      {/* TITLE */}
      <div className="text-center border-b border-slate-800 pb-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-yellow-400 drop-shadow-lg">
          March Madness Bracket
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Make your picks and advance your champion
        </p>
      </div>

      {/* FULL BRACKET GRID */}
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-8 justify-center">

          {/* LEFT SIDE REGIONS */}
          <div className="flex flex-col gap-6">
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

          {/* FINAL FOUR */}
          <div className="flex flex-col gap-6 col-span-1 xl:col-span-1">
            <FinalFourPanel
              matchups={bracket.finalFour}
              onPick={onPick}
            />
          </div>

          {/* CHAMPIONSHIP */}
          <div className="flex flex-col gap-6 col-span-1 xl:col-span-1">
            <ChampionshipPanel
              matchup={bracket.championship}
              onPick={onPick}
            />
          </div>

          {/* RIGHT SIDE REGIONS */}
          <div className="flex flex-col gap-6">
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
    </div>
  );
}
