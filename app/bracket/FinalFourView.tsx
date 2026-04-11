"use client";

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
type FinalFourViewProps = {
  bracket: { bracket_id: string };
  games: Game[];
  picks: Pick[];
  isLocked: boolean;
  onPick: (gameId: number, teamId: string) => void;
  setView: (view: any) => void;
};

// -----------------------------
// COMPONENT
// -----------------------------
export default function FinalFourView({
  bracket,
  games,
  picks,
  isLocked,
  onPick,
  setView,
}: FinalFourViewProps) {
  // -----------------------------
  // REGION → WINNER LOOKUP
  // -----------------------------
  function getRegionWinner(regionName: string): Team | null {
    const regionGames = games.filter((g) => g.region === regionName);
    const elite8Game = regionGames.find((g) => g.round === 4);

    if (!elite8Game) return null;

    const pick = picks.find((p) => p.game_id === elite8Game.game_id);
    if (!pick) return null;

    const team =
      elite8Game.team1?.team_id === pick.selected_team
        ? elite8Game.team1
        : elite8Game.team2;

    return team || null;
  }

  // -----------------------------
  // CORRECT NCAA PAIRINGS
  // -----------------------------
  const semifinalMatchups = [
    { left: "East", right: "South", gameId: 61 },
    { left: "Midwest", right: "West", gameId: 62 },
  ];

  const getSelectedTeamId = (gameId: number) => {
    const pick = picks.find((p) => p.game_id === gameId);
    return pick ? pick.selected_team : null;
  };

  // -----------------------------
  // UPGRADED TEAM BUTTON
  // -----------------------------
  const renderTeamButton = (
    gameId: number,
    team: Team | null,
    selectedTeamId: string | null
  ) => {
    if (!team) {
      return (
        <div className="text-xs text-slate-500 italic px-3 py-2 border border-dashed border-slate-700 rounded-md h-10 flex items-center">
          TBD
        </div>
      );
    }

    const isSelected = selectedTeamId === team.team_id;
    const logo = getTeamLogo(team.name);

    return (
      <button
        type="button"
        onClick={() => onPick(gameId, team.team_id)}
        disabled={isLocked}
        className={`
          relative flex items-center gap-3 px-3 h-10 rounded-md text-xs
          border transition-all w-full
          ${
            isSelected
              ? `
                bg-emerald-600/30 
                border-emerald-400 
                text-white 
                shadow-[0_0_12px_rgba(16,185,129,0.5)]
                `
              : `
                bg-white/5 
                border-white/10 
                text-slate-100 
                hover:bg-white/10 
                hover:scale-[1.02]
                `
          }
          ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
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
              text-[10px] font-bold px-1.5 py-0.5 rounded 
              ${
                isSelected
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-200"
              }
            `}
          >
            {team.seed}
          </span>
        )}

        <span className="flex-1 text-left text-sm tracking-wide">
          {team.name}
        </span>
      </button>
    );
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ----------------------------- */}
      {/* PREMIUM HEADER */}
      {/* ----------------------------- */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏀</span>

            <h2 className="text-2xl font-semibold tracking-wide text-slate-100">
              Final Four
            </h2>
          </div>

          <div className="h-[3px] w-24 mt-1 rounded-full bg-violet-500" />
        </div>

        <button
          onClick={() => setView("grid")}
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

      {/* ----------------------------- */}
      {/* SEMIFINAL MATCHUPS */}
      {/* ----------------------------- */}
      <div className="flex flex-col gap-6">
        {semifinalMatchups.map((m, index) => {
          const leftTeam = getRegionWinner(m.left);
          const rightTeam = getRegionWinner(m.right);
          const selectedTeamId = getSelectedTeamId(m.gameId);

          return (
            <div
              key={m.gameId}
              className="
                flex flex-col gap-3 p-4 rounded-xl
                bg-white/5 border border-white/10 backdrop-blur-sm
                shadow-lg shadow-black/40
                relative overflow-hidden
              "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl" />

              <div className="relative z-10">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-300 mb-2">
                  Semifinal {index + 1} — {m.left} vs {m.right}
                </div>

                <div className="flex flex-col gap-2">
                  {renderTeamButton(m.gameId, leftTeam, selectedTeamId)}
                  {renderTeamButton(m.gameId, rightTeam, selectedTeamId)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ----------------------------- */}
      {/* PREMIUM CONTINUE BUTTON */}
      {/* ----------------------------- */}
      <button
        onClick={() => setView("championship")}
        className="
          self-center px-6 py-3 rounded-xl text-white font-semibold tracking-wide
          bg-gradient-to-br from-violet-400 to-violet-600
          shadow-lg shadow-violet-900/40
          border border-white/10 backdrop-blur-md
          transition-all duration-300
          hover:scale-[1.04] hover:shadow-violet-500/40 hover:ring-2 hover:ring-violet-300/40
          active:scale-[0.97]
          flex items-center gap-2
        "
      >
        Continue to Championship
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}
