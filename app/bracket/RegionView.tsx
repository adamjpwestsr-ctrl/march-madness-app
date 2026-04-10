"use client";

import { Game, Pick } from "./types"; // If you don’t have a shared types file, remove this line.
import { getTeamLogo } from "../../lib/getTeamLogo";

type RegionViewProps = {
  region: string;
  bracket: { bracket_id: string };
  games: Game[];
  picks: Pick[];
  isLocked: boolean;
  onPick: (gameId: number, teamId: string) => void;
  setView: (view: any) => void;
};

export default function RegionView({
  region,
  bracket,
  games,
  picks,
  isLocked,
  onPick,
  setView,
}: RegionViewProps) {
  // Filter games for this region only
  const regionGames = games
    .filter((g) => g.region === region)
    .sort((a, b) => a.round - b.round);

  // Group by round
  const rounds = Array.from(new Set(regionGames.map((g) => g.round))).sort(
    (a, b) => a - b
  );

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
        <h2 className="text-xl font-bold text-slate-100">{region} Region</h2>

        <button
          onClick={() => setView("grid")}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
        >
          ← Back to Regions
        </button>
      </div>

      {/* Region Bracket */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {rounds.map((round) => {
          const roundGames = regionGames.filter((g) => g.round === round);

          return (
            <div key={round} className="flex flex-col gap-2 min-w-[200px]">
              <div className="text-xs font-semibold text-slate-400 mb-1 text-center">
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
                    className="flex flex-col gap-1 bg-slate-800/60 rounded-md p-2"
                  >
                    {renderTeamButton(game, game.team1, selectedTeamId)}
                    {renderTeamButton(game, game.team2, selectedTeamId)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        onClick={() => setView("final-four")}
        className="self-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
      >
        Continue to Final Four →
      </button>
    </div>
  );
}
