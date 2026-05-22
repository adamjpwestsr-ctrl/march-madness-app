"use client";

import { useState } from "react";
import RegionView from "./RegionView";
import FinalFourView from "./FinalFourView";
import ChampionshipView from "./ChampionshipView";
import MulliganModal from "./MulliganModal";
import OpeningRoundView from "./OpeningRoundView";
import { RegionButton } from "./RegionButton";

import { Game } from "@/lib/bracketTypes";

// -----------------------------
// PROPS INTERFACE
// -----------------------------
type BracketShellProps = {
  games: Game[];
  picks: Record<number, string | null>;
  mulligans: { remaining: number };
  bracketName: string;
  tiebreaker: number | null;
  isLocked: boolean;
  isSubmitted: boolean;
  mulliganGame: Game | null;

  onPick: (gameId: number, team: string) => void;
  onUseMulligan: (game: Game) => void;
  onApplyMulligan: (gameId: number, newTeam: string) => void;

  onSubmit: () => void;
  onRename: (name: string) => void;
  onSetTiebreaker: (value: number) => void;
  onCloseMulligan: () => void;
};

// -----------------------------
// COMPONENT
// -----------------------------
export default function BracketShell({
  games,
  picks,
  mulligans,
  bracketName,
  tiebreaker,
  isLocked,
  isSubmitted,
  mulliganGame,
  onPick,
  onUseMulligan,
  onApplyMulligan,
  onSubmit,
  onRename,
  onSetTiebreaker,
  onCloseMulligan,
}: BracketShellProps) {
  const [view, setView] = useState<
    | "opening-round"
    | "regions"
    | "East"
    | "West"
    | "South"
    | "Midwest"
    | "final-four"
    | "championship"
  >("opening-round");

  const regionNames = ["East", "West", "South", "Midwest"];

  return (
    <div className="bracket-shell flex flex-col gap-6">
      {/* TITLE */}
      <h1 className="bracket-title text-2xl font-bold">{bracketName}</h1>

      {/* LOCK BANNER */}
      {isLocked && (
        <div className="bracket-locked-banner text-red-400">
          Bracket submissions are locked.
        </div>
      )}

      {/* RENAME */}
      <div className="bracket-rename flex gap-2 items-center">
        <input
          type="text"
          value={bracketName}
          onChange={(e) => onRename(e.target.value)}
          disabled={isLocked || isSubmitted}
          className="bracket-name-input bg-slate-800 border border-slate-700 rounded px-3 py-1 text-slate-100"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLocked || isSubmitted}
          className="save-name-button bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Save Name
        </button>
      </div>

      {/* TIEBREAKER */}
      <div className="tiebreaker-section flex flex-col gap-1">
        <label className="tiebreaker-label text-sm opacity-80">
          Championship Total Points (Tiebreaker)
        </label>
        <input
          type="number"
          value={tiebreaker ?? ""}
          onChange={(e) => onSetTiebreaker(Number(e.target.value))}
          disabled={isLocked || isSubmitted}
          className="tiebreaker-input bg-slate-800 border border-slate-700 rounded px-3 py-1 text-slate-100"
          placeholder="Enter total points"
        />
      </div>

      {/* MULLIGANS */}
      <div className="mulligan-count text-sm opacity-80">
        Mulligans remaining: {mulligans.remaining}
      </div>

      {/* SUBMIT */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLocked || isSubmitted}
        className="submit-bracket-button bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded w-fit"
      >
        {isLocked
          ? "Bracket Locked"
          : isSubmitted
          ? "Bracket Submitted"
          : "Submit Bracket"}
      </button>

      {/* OPENING ROUND */}
      {view === "opening-round" && (
        <OpeningRoundView
          games={games.filter((g) => g.round === 0)}
          picks={picks}
          isLocked={isLocked}
          isSubmitted={isSubmitted}
          onPick={onPick}
          onContinue={() => setView("regions")}
        />
      )}

      {/* REGION SELECTION GRID */}
      {view === "regions" && (
        <div className="region-selection grid grid-cols-2 gap-4 mt-4">
          {regionNames.map((region) => (
            <RegionButton
              key={region}
              label={`${region} Region`}
              icon="🏀"
              gradient="from-cyan-500 to-blue-600"
              onClick={() => setView(region as any)}
            />
          ))}
        </div>
      )}

      {/* REGION VIEWS */}
      {regionNames.includes(view) && (
        <RegionView
          regionName={view}
          games={games.filter((g) => g.region === view)}
          picks={picks}
          isLocked={isLocked}
          isSubmitted={isSubmitted}
          mulligans={mulligans}
          onPick={onPick}
          onUseMulligan={onUseMulligan}
          onContinue={() => setView("final-four")}
          onBack={() => setView("regions")}
        />
      )}

      {/* FINAL FOUR */}
      {view === "final-four" && (
        <FinalFourView
          games={games.filter((g) => g.round === 5)}
          picks={picks}
          isLocked={isLocked}
          isSubmitted={isSubmitted}
          onPick={onPick}
          onUseMulligan={onUseMulligan}
          onContinue={() => setView("championship")}
          onBack={() => setView("regions")}
        />
      )}

      {/* CHAMPIONSHIP */}
      {view === "championship" && (
        <ChampionshipView
          games={games.filter((g) => g.round === 6)}
          picks={picks}
          isLocked={isLocked}
          isSubmitted={isSubmitted}
          onPick={onPick}
          onSubmit={onSubmit}
          onBack={() => setView("final-four")}
        />
      )}

      {/* MULLIGAN MODAL */}
      {mulliganGame && !isLocked && !isSubmitted && (
        <MulliganModal
          game={mulliganGame}
          onApply={(gameId, newTeam) => onApplyMulligan(gameId, newTeam)}
          onClose={onCloseMulligan}
        />
      )}
    </div>
  );
}
