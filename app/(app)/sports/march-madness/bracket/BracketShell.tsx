"use client";

import { useState } from "react";
import RegionView from "./RegionView";
import FinalFourView from "./FinalFourView";
import ChampionshipView from "./ChampionshipView";
import MulliganModal from "./MulliganModal";

import { Game } from "@/lib/bracketTypes";

// -----------------------------
// PROPS INTERFACE
// -----------------------------
type BracketShellProps = {
  games: Game[];
  picks: Record<number, string | null>;   // ← FIXED HERE
  mulligans: { remaining: number };
  bracketName: string;
  tiebreaker: number | null;
  isLocked: boolean;
  isSubmitted: boolean;
  mulliganGame: Game | null;

  onPick: (gameId: number, team: string) => void; // team is always string
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
    "East" | "West" | "South" | "Midwest" | "final-four" | "championship"
  >("East");

  const regionNames = ["East", "West", "South", "Midwest"];

  return (
    <div className="bracket-shell flex flex-col gap-6">
      {/* TITLE */}
      <h1 className="bracket-title">{bracketName}</h1>

      {/* LOCK BANNER */}
      {isLocked && (
        <div className="bracket-locked-banner">
          Bracket submissions are locked.
        </div>
      )}

      {/* RENAME */}
      <div className="bracket-rename">
        <input
          type="text"
          value={bracketName}
          onChange={(e) => onRename(e.target.value)}
          disabled={isLocked || isSubmitted}
          className="bracket-name-input"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLocked || isSubmitted}
          className="save-name-button"
        >
          Save Name
        </button>
      </div>

      {/* TIEBREAKER */}
      <div className="tiebreaker-section">
        <label className="tiebreaker-label">
          Championship Total Points (Tiebreaker)
        </label>
        <input
          type="number"
          value={tiebreaker ?? ""}
          onChange={(e) => onSetTiebreaker(Number(e.target.value))}
          disabled={isLocked || isSubmitted}
          className="tiebreaker-input"
          placeholder="Enter total points"
        />
      </div>

      {/* MULLIGANS */}
      <div className="mulligan-count">
        Mulligans remaining: {mulligans.remaining}
      </div>

      {/* SUBMIT */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLocked || isSubmitted}
        className="submit-bracket-button"
      >
        {isLocked
          ? "Bracket Locked"
          : isSubmitted
          ? "Bracket Submitted"
          : "Submit Bracket"}
      </button>

      {/* REGION VIEWS */}
      {regionNames.includes(view) && (
        <RegionView
          regionName={view}
          games={games}
          picks={picks}
          isLocked={isLocked}
          isSubmitted={isSubmitted}
          mulligans={mulligans}
          onPick={onPick}
          onUseMulligan={onUseMulligan}
          onContinue={() => setView("final-four")}
          onBack={() => setView("East")}
        />
      )}

      {/* FINAL FOUR */}
      {view === "final-four" && (
        <FinalFourView
          games={games}
          picks={picks}
          isLocked={isLocked}
          isSubmitted={isSubmitted}
          onPick={onPick}
          onUseMulligan={onUseMulligan}
          onContinue={() => setView("championship")}
          onBack={() => setView("East")}
        />
      )}

      {/* CHAMPIONSHIP */}
      {view === "championship" && (
        <ChampionshipView
          games={games}
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
