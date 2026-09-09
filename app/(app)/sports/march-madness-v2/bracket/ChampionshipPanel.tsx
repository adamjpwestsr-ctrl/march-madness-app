"use client";

import React, { useRef, useEffect } from "react";
import MatchupCard from "./MatchupCard";
import ConfettiBurst from "../fx/ConfettiBurst";

export default function ChampionshipPanel({
  matchup,
  onPick,
}: {
  matchup: any; // single championship game
  onPick: (gameId: string, teamId: string) => void;
}) {
  const confettiRef = useRef<HTMLButtonElement>(null);

  // Fire confetti when a champion is selected
  useEffect(() => {
    if (matchup?.selectedTeamId) {
      confettiRef.current?.click();
    }
  }, [matchup?.selectedTeamId]);

  if (!matchup) {
    return (
      <div className="rounded-xl bg-slate-900/40 border border-white/10 p-6 text-center text-slate-400">
        Championship matchup not available.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900/60 border border-yellow-500/30 p-8 shadow-xl backdrop-blur-sm">
      {/* CONFETTI TRIGGER */}
      <ConfettiBurst ref={confettiRef} type="champion" />

      {/* TITLE */}
      <h2 className="text-4xl font-extrabold text-center text-yellow-400 tracking-tight mb-6 drop-shadow-lg">
        National Championship
      </h2>

      {/* MATCHUP */}
      <div className="flex flex-col gap-6">
        <MatchupCard
          key={matchup.id}
          game={matchup}
          roundId="championship"
          onPick={onPick}
        />
      </div>

      {/* CHAMPION DISPLAY */}
      {matchup.selectedTeamId && (
        <div className="mt-8 text-center">
          <div className="inline-block px-6 py-3 rounded-xl bg-yellow-500 text-black font-bold text-xl shadow-lg">
            Champion: {matchup.selectedTeamName}
          </div>
        </div>
      )}
    </div>
  );
}
