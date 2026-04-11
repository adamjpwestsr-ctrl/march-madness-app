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
    const elite8Game = regionGames.find((g) => g.round === 4); // Elite 8 winner

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
  // TEAM BUTTON
  // -----------------------------
  const renderTeamButton = (
    gameId: number,
    team: Team | null,
    selectedTeamId: string | null
  ) => {
    if (!team) {
      return (
        <div className="text-xs text-slate-500 italic px-2 py-1 border border-dashed border-slate-700 rounded h-9 flex items-center">
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
        className={`flex items-center gap-2 px-2 h-9 rounded text-xs border transition w-full
          ${
            isSelected
              ? "bg-emerald-600/80 border-emerald-400 text-white"
              : "bg-slate-900/60 border-slate-600 text-slate-100 hover:bg-slate-700/80"
          }
          ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {logo && (
          <img
            src={logo}
            alt={team.name}
            className="w-5 h-5 rounded-full object-cover"
          />
        )}

        {team.seed !== null && (
          <span className="text-xs font-bold text-slate-100">{team.seed}</span>
        )}

        <span className="flex-1 text-left">{team.name}</span>
      </button>
    );
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Final Four</h2>

        <button
          onClick={() => setView("grid")}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
        >
          ← Back to Regions
        </button>
      </div>

      {/* Semifinals */}
      <div className="flex flex-col gap-6">
        {semifinalMatchups.map((m, index) => {
          const leftTeam = getRegionWinner(m.left);
          const rightTeam = getRegionWinner(m.right);
          const selectedTeamId = getSelectedTeamId(m.gameId);

          return (
            <div
              key={m.gameId}
              className="flex flex-col gap-2 bg-slate-800/60 rounded-md p-4 border border-slate-700"
            >
              <div className="text-xs font-semibold text-slate-400 mb-1">
                Semifinal {index + 1} — {m.left} vs {m.right}
              </div>

              {renderTeamButton(m.gameId, leftTeam, selectedTeamId)}
              {renderTeamButton(m.gameId, rightTeam, selectedTeamId)}
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        onClick={() => setView("championship")}
        className="self-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
      >
        Continue to Championship →
      </button>
    </div>
  );
}
