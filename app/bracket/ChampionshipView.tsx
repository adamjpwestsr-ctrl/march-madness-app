"use client";

import { useEffect, useState } from "react";
import { getTeamLogo } from "../../lib/getTeamLogo";

// -----------------------------
// INLINE TYPES
// -----------------------------
type Team = {
  team_id: string;
  name: string;
  seed: number | null;
};

type Game = {
  game_id: number;
  round: number;
  region: string;
  team1: Team | null;
  team2: Team | null;
  winner: string | null;
  source_game1: number | null;
  source_game2: number | null;
};

type Pick = {
  bracket_id: string;
  game_id: number;
  selected_team: string;
};

// -----------------------------
// PROPS
// -----------------------------
type ChampionshipViewProps = {
  bracket: { bracket_id: string };
  games: Game[];
  picks: Pick[];
  isLocked: boolean;
  onPick: (gameId: number, teamId: string) => void;
  setView: (view: any) => void;
};

// -----------------------------
// CONSTANTS
// -----------------------------
const ROUND_LABEL = "National Championship";

// -----------------------------
// COMPONENT
// -----------------------------
export default function ChampionshipView({
  bracket,
  games,
  picks,
  isLocked,
  onPick,
  setView,
}: ChampionshipViewProps) {
  const [mounted, setMounted] = useState(false);
  const [lastAnimatedRound, setLastAnimatedRound] = useState<number | null>(null);
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const championshipGame = games.find((g) => g.round === 6) || null;

  const getSelectedTeamId = (gameId: number) => {
    const pick = picks.find((p) => p.game_id === gameId);
    return pick ? pick.selected_team : null;
  };

  const handlePick = (game: Game, teamId: string) => {
    if (isLocked) return;
    setLastAnimatedRound(game.round);
    onPick(game.game_id, teamId);
  };

  // -----------------------------
  // TEAM BUTTON
  // -----------------------------
  const renderTeamButton = (
    game: Game,
    team: Team | null,
    selectedTeamId: string | null
  ) => {
    if (!team) {
      return (
        <div className="text-xs text-slate-500 italic px-3 py-2 border border-dashed border-slate-700 rounded-md h-9 flex items-center">
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
        onClick={() => handlePick(game, team.team_id)}
        onMouseEnter={() => setHoveredTeamId(team.team_id)}
        onMouseLeave={() =>
          setHoveredTeamId((prev) => (prev === team.team_id ? null : prev))
        }
        disabled={isLocked}
        className={`
          relative flex items-center gap-2 px-3 h-9 rounded-md text-xs
          border transition-all w-full
          ${
            isSelected || isHovered
              ? "bg-emerald-600/30 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              : "bg-white/5 border-white/10 text-slate-100 hover:bg-white/10 hover:scale-[1.02]"
          }
          ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {logo && (
          <img
            src={logo}
            alt={team.name}
            className="w-5 h-5 rounded-full object-cover shadow-sm"
          />
        )}

        {team.seed !== null && (
          <span
            className={`
              text-[10px] font-bold px-1.5 py-0.5 rounded 
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

        <span className="flex-1 text-left text-[11px] tracking-wide truncate">
          {team.name}
        </span>
      </button>
    );
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold tracking-wide text-slate-100 flex items-center gap-2">
          🏆 Championship
        </h2>

        <button
          onClick={() => setView("final-four")}
          className="
            flex items-center gap-2 px-3 py-1.5
            bg-white/5 border border-white/10 backdrop-blur-md
            text-slate-200 text-xs rounded-lg
            shadow-md shadow-black/40
            hover:ring-2 hover:ring-white/20 hover:scale-[1.03]
            transition-all duration-200
          "
        >
          <span className="text-sm">←</span>
          Back
        </button>
      </div>

      {/* BRACKET LAYOUT */}
      <div className="overflow-y-auto overflow-x-hidden pb-6">
        <div className="grid grid-cols-[minmax(180px,1fr)] gap-6">
          {/* STICKY HEADER */}
          <div
            className="
              sticky top-0 z-20
              h-12 flex items-center justify-center
              text-[10px] font-semibold uppercase tracking-wide
              px-3 rounded-md mb-1
              backdrop-blur-md bg-slate-900/40
              border border-white/10
              shadow-md shadow-black/40
              text-slate-200
            "
          >
            {ROUND_LABEL}
          </div>

          {/* GAME CARD */}
          {championshipGame && (
            <div
              className="
                flex flex-col items-stretch
                rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm
                shadow-lg shadow-black/40
                px-3 py-2
              "
            >
              <div className="flex flex-col gap-1">
                {renderTeamButton(
                  championshipGame,
                  championshipGame.team1,
                  getSelectedTeamId(championshipGame.game_id)
                )}
                {renderTeamButton(
                  championshipGame,
                  championshipGame.team2,
                  getSelectedTeamId(championshipGame.game_id)
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={() => setView("summary")}
        className="
          self-center px-6 py-3 rounded-xl text-white font-semibold tracking-wide
          bg-gradient-to-br from-emerald-400 to-emerald-600
          shadow-lg shadow-emerald-900/40
          border border-white/10 backdrop-blur-md
          transition-all duration-300
          hover:scale-[1.04] hover:shadow-emerald-500/40 hover:ring-2 hover:ring-emerald-300/40
          active:scale-[0.97]
          flex items-center gap-2
        "
      >
        Submit Bracket
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}
