"use client";

import { useState } from "react";
import { getTeamLogo } from "@/lib/getTeamLogo";
import { motion } from "framer-motion";
import { Game } from "@/lib/bracketTypes";

// -----------------------------
// PROPS INTERFACE
// -----------------------------
type ChampionshipViewProps = {
  games: Game[];
  picks: Record<number, string | null>;
  isLocked: boolean;
  isSubmitted: boolean;

  onPick: (gameId: number, teamId: string) => void;
  onSubmit: (tiebreaker: number) => void;

  onBack: () => void;
};

// -----------------------------
// COMPONENT
// -----------------------------
export default function ChampionshipView({
  games,
  picks,
  isLocked,
  isSubmitted,
  onPick,
  onSubmit,
  onBack,
}: ChampionshipViewProps) {
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [tiebreaker, setTiebreaker] = useState<number | "">("");

  const championshipGame = games.find((g) => g.round === 6);
  const selectedTeamId = championshipGame
    ? picks[championshipGame.game_id] ?? null
    : null;

  const handlePick = (teamId: string) => {
    if (isLocked || isSubmitted || !championshipGame) return;
    onPick(championshipGame.game_id, teamId);
  };

  const handleSubmit = () => {
    if (isLocked || isSubmitted) return;

    const value = Number(tiebreaker);
    if (Number.isNaN(value)) {
      alert("Please enter a valid tiebreaker score.");
      return;
    }

    onSubmit(value);
  };

  const renderTeamButton = (
    team: { team_id: string; name: string; seed: number | null } | null
  ) => {
    if (!team) {
      return (
        <div className="text-xs text-slate-500 italic px-3 py-2 border border-dashed border-slate-700 rounded-md h-10 flex items-center">
          TBD
        </div>
      );
    }

    const isSelected = selectedTeamId === team.team_id;
    const isHovered = hoveredTeamId === team.team_id;
    const logo = getTeamLogo(team.name);

    return (
      <button
        type="button"
        onClick={() => handlePick(team.team_id)}
        onMouseEnter={() => setHoveredTeamId(team.team_id)}
        onMouseLeave={() =>
          setHoveredTeamId((prev) => (prev === team.team_id ? null : prev))
        }
        disabled={isLocked || isSubmitted}
        className={`
          relative flex items-center gap-2 px-3 h-10 rounded-md text-sm
          border transition-all w-full
          ${
            isSelected || isHovered
              ? "bg-emerald-600/30 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              : "bg-white/5 border-white/10 text-slate-100 hover:bg-white/10 hover:scale-[1.02]"
          }
          ${(isLocked || isSubmitted) ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {logo && (
          <img
            src={logo}
            alt={team.name}
            className="w-6 h-6 rounded-full object-cover shadow-sm"
          />
        )}

        {team.seed !== null && (
          <span
            className={`
              text-[11px] font-bold px-1.5 py-0.5 rounded 
              ${
                isSelected || isHovered
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-200"
              }
            `}
          >
            {team.seed}
          </span>
        )}

        <span className="flex-1 text-left text-[12px] tracking-wide truncate">
          {team.name}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* SUBMITTED BANNER */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="p-3 rounded-lg bg-emerald-600 text-white text-center shadow-xl"
        >
          Bracket Submitted!
        </motion.div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold tracking-wide text-slate-100 flex items-center gap-2">
          🏆 Championship
        </h2>

        <button
          onClick={onBack}
          className="
            flex items-center gap-2 px-3 py-1.5
            bg-white/5 border border-white/10 backdrop-blur-md
            text-slate-200 text-xs rounded-lg
            shadow-md shadow-black/40
            hover:ring-2 hover:ring-white/20 hover:scale-[1.03]
            transition-all duration-200
          "
        >
          ← Back
        </button>
      </div>

      {/* MATCHUP */}
      <div
        className="
          flex flex-col gap-4
          rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm
          shadow-lg shadow-black/40
          px-4 py-4
        "
      >
        {championshipGame ? (
          <>
            {renderTeamButton(championshipGame.team1)}
            {renderTeamButton(championshipGame.team2)}
          </>
        ) : (
          <div className="text-slate-400 text-sm italic">Loading...</div>
        )}
      </div>

      {/* TIEBREAKER */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-300 tracking-wide">
          Championship Total Points (Tiebreaker)
        </label>
        <input
          type="number"
          value={tiebreaker}
          onChange={(e) =>
            setTiebreaker(e.target.value === "" ? "" : Number(e.target.value))
          }
          disabled={isLocked || isSubmitted}
          className="
            w-32 px-3 py-2 rounded-md text-sm
            bg-white/5 border border-white/10 text-slate-100
            shadow-inner shadow-black/20
            focus:ring-2 focus:ring-emerald-400/40 focus:outline-none
          "
          placeholder="e.g. 142"
        />
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={isLocked || isSubmitted}
        className="
          self-center px-6 py-3 rounded-xl text-white font-semibold tracking-wide
          bg-gradient-to-br from-emerald-400 to-emerald-600
          shadow-lg shadow-emerald-900/40
          border border-white/10 backdrop-blur-md
          transition-all duration-300
          hover:scale-[1.04] hover:shadow-emerald-500/40 hover:ring-2 hover:ring-emerald-300/40
          active:scale-[0.97]
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
        "
      >
        Submit Bracket →
      </button>
    </div>
  );
}

