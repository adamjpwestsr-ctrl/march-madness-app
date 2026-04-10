"use client";

import { Game, Pick } from "./types"; // Remove if not using shared types
import { getTeamLogo } from "../../lib/getTeamLogo";
import { submitBracket } from "./actions";
import { useRef } from "react";

type ChampionshipViewProps = {
  bracket: { bracket_id: string };
  games: Game[];
  picks: Pick[];
  isLocked: boolean;
  tiebreaker: string;
  setTiebreaker: (v: string) => void;
  setSubmittedBanner: (v: string) => void;
  formRef: React.RefObject<HTMLFormElement>;
  onPick: (gameId: number, teamId: string) => void;
  setView: (view: any) => void;
};

export default function ChampionshipView({
  bracket,
  games,
  picks,
  isLocked,
  tiebreaker,
  setTiebreaker,
  setSubmittedBanner,
  formRef,
  onPick,
  setView,
}: ChampionshipViewProps) {
  // Championship game is round 6
  const championshipGame = games.find((g) => g.round === 6);

  if (!championshipGame) {
    return (
      <div className="text-slate-200 text-center py-10">
        Championship game not found.
      </div>
    );
  }

  const selectedTeamId =
    picks.find((p) => p.game_id === championshipGame.game_id)?.selected_team ||
    null;

  const renderTeamButton = (team: any) => {
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
        onClick={() => onPick(championshipGame.game_id, team.team_id)}
        disabled={isLocked}
        className={`flex items-center gap-2 px-2 h-10 rounded text-sm border transition w-full
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
            className="w-6 h-6 rounded-full object-cover"
          />
        )}

        {team.seed !== null && (
          <span className="text-xs font-bold text-slate-100">{team.seed}</span>
        )}

        <span className="flex-1 text-left">{team.name}</span>
      </button>
    );
  };

  const handleSubmit = () => {
    if (!tiebreaker) {
      alert("Please enter a tiebreaker score.");
      return;
    }

    const form = formRef.current;
    if (!form) return;

    const fd = new FormData(form);
    fd.set("tiebreaker", tiebreaker);
    fd.set("bracketId", bracket.bracket_id);

    submitBracket(fd);
    setSubmittedBanner("Bracket submitted successfully.");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Championship</h2>

        <button
          onClick={() => setView("final-four")}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
        >
          ← Back to Final Four
        </button>
      </div>

      {/* Championship Matchup */}
      <div className="flex flex-col gap-4 bg-slate-800/60 rounded-md p-4 border border-slate-700">
        <div className="text-xs font-semibold text-slate-400 mb-1">
          National Championship
        </div>

        {renderTeamButton(championshipGame.team1)}
        {renderTeamButton(championshipGame.team2)}
      </div>

      {/* Tiebreaker */}
      <div className="flex flex-col gap-2 max-w-xs">
        <label className="text-xs text-slate-300">
          Championship Total Points (Tiebreaker)
        </label>

        <input
          type="number"
          value={tiebreaker}
          onChange={(e) => setTiebreaker(e.target.value)}
          disabled={isLocked}
          className={`px-2 py-2 text-sm bg-slate-900/60 border border-slate-600 rounded text-slate-200
            ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
          `}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isLocked}
        className={`self-start px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm
          ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        Submit Bracket
      </button>
    </div>
  );
}
