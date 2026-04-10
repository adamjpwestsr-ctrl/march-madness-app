"use client";

import { Game, Pick } from "./types"; // Remove if not using shared types
import { getTeamLogo } from "../../lib/getTeamLogo";

type FinalFourViewProps = {
  bracket: { bracket_id: string };
  games: Game[];
  picks: Pick[];
  isLocked: boolean;
  onPick: (gameId: number, teamId: string) => void;
  setView: (view: any) => void;
};

export default function FinalFourView({
  bracket,
  games,
  picks,
  isLocked,
  onPick,
  setView,
}: FinalFourViewProps) {
  // Filter only Final Four games (round 5)
  const finalFourGames = games
    .filter((g) => g.round === 5)
    .sort((a, b) => a.game_id - b.game_id);

  const getSelectedTeamId = (gameId: number) => {
    const pick = picks.find((p) => p.game_id === gameId);
    return pick ? pick.selected_team : null;
  };

  const renderTeamButton = (game: Game, team: any, selectedTeamId: string | null) => {
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
        onClick={() => onPick(game.game_id, team.team_id)}
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

      {/* Final Four Matchups */}
      <div className="flex flex-col gap-6">
        {finalFourGames.map((game) => {
          const selectedTeamId = getSelectedTeamId(game.game_id);

          return (
            <div
              key={game.game_id}
              className="flex flex-col gap-2 bg-slate-800/60 rounded-md p-4 border border-slate-700"
            >
              <div className="text-xs font-semibold text-slate-400 mb-1">
                Semifinal {game.game_id === 61 ? "1" : "2"}
              </div>

              {renderTeamButton(game, game.team1, selectedTeamId)}
              {renderTeamButton(game, game.team2, selectedTeamId)}
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
