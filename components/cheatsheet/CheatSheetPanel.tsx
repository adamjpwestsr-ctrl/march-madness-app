
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CheatSheetCard from "./CheatSheetCard";

type SelectedMatchup = {
  game: any;
  team1: any;
  team2: any;
  team1IsOpeningRoundTeam: boolean;
  team2IsOpeningRoundTeam: boolean;
};

export default function CheatSheetPanel({
  selectedMatchup,
  onClose,
}: {
  selectedMatchup: SelectedMatchup | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedMatchup) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMatchup, onClose]);

  if (!mounted || !selectedMatchup) return null;

  const { game, team1, team2 } = selectedMatchup;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        overflow-hidden
        bg-black/85 backdrop-blur-md
        p-0 sm:p-3 lg:p-5
      "
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cheat-sheet-title"
        onClick={(event) => event.stopPropagation()}
        className="
          relative flex
          h-[100dvh] w-full min-w-0 max-w-full
          flex-col overflow-hidden
          border border-slate-700/80
          bg-[#071225]
          shadow-[0_25px_100px_rgba(0,0,0,0.65)]
          sm:h-[96dvh] sm:rounded-2xl
          lg:h-[94dvh] lg:max-h-[950px]
          lg:max-w-[1500px]
        "
      >
        {/* FIXED HEADER */}
        <div
          className="
            relative z-40 flex shrink-0
            items-center justify-between gap-3
            border-b border-white/10
            bg-[#0b1930]
            px-4 py-3
            sm:px-6 sm:py-4
          "
        >
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-400 sm:text-[10px]">
              BracketBoss · Matchup Center
            </p>

            <h2
              id="cheat-sheet-title"
              className="mt-0.5 text-lg font-black tracking-tight text-white sm:text-xl"
            >
              Matchup Cheat Sheet
            </h2>

            <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
              Your statistical matchup and pick advisor
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close matchup cheat sheet"
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl border border-slate-600
              bg-slate-800/80 text-slate-300
              transition hover:border-cyan-400/60
              hover:bg-slate-700 hover:text-white
              focus:outline-none focus:ring-2 focus:ring-cyan-400
            "
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* SCROLLABLE CHEAT SHEET CONTENT */}
        <div
          className="
            min-h-0 min-w-0 flex-1
            overflow-y-auto overflow-x-hidden
            overscroll-contain
            p-2 sm:p-3 lg:p-4
          "
        >
          <div className="mx-auto w-full min-w-0 max-w-[1450px]">
            <CheatSheetCard
  teamA={team1}
  teamB={team2}
  round={game?.round}
  isTeamAOpeningRound={selectedMatchup.team1IsOpeningRoundTeam}
  isTeamBOpeningRound={selectedMatchup.team2IsOpeningRoundTeam}
/>
          </div>
        </div>

        {/* FIXED BOTTOM ACCENT */}
        <div className="h-1 shrink-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
      </section>
    </div>,
    document.body
  );
}
