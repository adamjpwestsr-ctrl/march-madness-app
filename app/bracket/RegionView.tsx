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
type RegionViewProps = {
  region: string;
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
export default function RegionView({
  region,
  bracket,
  games,
  picks,
  isLocked,
  onPick,
  setView,
}: RegionViewProps) {
  const regionGames = games
    .filter((g) => g.region === region)
    .sort((a, b) => a.round - b.round);

  const rounds = Array.from(new Set(regionGames.map((g) => g.round))).sort(
    (a, b) => a - b
  );

  const getSelectedTeamId = (gameId: number) => {
    const pick = picks.find((p) => p.game_id === gameId);
    return pick ? pick.selected_team : null;
  };

  // -----------------------------
  // UPGRADED TEAM BUTTON
  // -----------------------------
  const renderTeamButton = (
    game: Game,
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
        onClick={() => onPick(game.game_id, team.team_id)}
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

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ----------------------------- */}
      {/* HEADER */}
      {/* ----------------------------- */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {region === "East" && "🧭"}
              {region === "West" && "🌄"}
              {region === "South" && "☀️"}
              {region === "Midwest" && "⭐"}
              {region === "Final Four" && "🏀"}
              {region === "Championship" && "🏆"}
            </span>

            <h2 className="text-2xl font-semibold tracking-wide text-slate-100">
              {region} Region
            </h2>
          </div>

          <div
            className={`
              h-[3px] w-24 mt-1 rounded-full
              ${
                region === "East"
                  ? "bg-emerald-500"
                  : region === "West"
                  ? "bg-blue-500"
                  : region === "South"
                  ? "bg-rose-500"
                  : region === "Midwest"
                  ? "bg-amber-500"
                  : region === "Final Four"
                  ? "bg-violet-500"
                  : "bg-yellow-500"
              }
            `}
          />
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
      {/* ROUND LABELS + GAME CARDS */}
      {/* ----------------------------- */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {rounds.map((round) => {
          const roundGames = regionGames.filter((g) => g.round === round);

          return (
            <div key={round} className="flex flex-col gap-3 min-w-[220px]">
              <div
                className="
                  text-[10px] font-semibold uppercase tracking-wide
                  px-3 py-1 rounded-full mx-auto mb-1
                  bg-white/5 border border-white/10 backdrop-blur-md
                  shadow-[0_0_10px_rgba(0,0,0,0.3)]
                  text-slate-200
                "
              >
                {round === 1 && "Round of 64"}
                {round === 2 && "Round of 32"}
                {round === 3 && "Sweet 16"}
                {round === 4 && "Elite 8"}
              </div>

              {roundGames.map((game) => {
                const selectedTeamId = getSelectedTeamId(game.game_id);

                return (
                  <div
                    key={game.game_id}
                    className="
                      flex flex-col gap-2 p-3 rounded-xl
                      bg-white/5 border border-white/10 backdrop-blur-sm
                      shadow-lg shadow-black/40
                      relative overflow-hidden
                    "
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl" />

                    <div className="relative z-10 flex flex-col gap-2">
                      {renderTeamButton(game, game.team1, selectedTeamId)}
                      {renderTeamButton(game, game.team2, selectedTeamId)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ----------------------------- */}
      {/* UPGRADED CONTINUE BUTTON */}
      {/* ----------------------------- */}
      <button
        onClick={() => setView("final-four")}
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
        Continue to Final Four
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}
