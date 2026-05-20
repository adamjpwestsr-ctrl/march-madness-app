"use client";

import { useState } from "react";
import { getTeamLogo } from "@/lib/getTeamLogo";
import { Game } from "@/lib/bracketTypes";

// -----------------------------
// PROPS INTERFACE
// -----------------------------
type MulliganModalProps = {
  game: Game;
  onApply: (gameId: number, newTeam: string) => void;
  onClose: () => void;
};

// -----------------------------
// COMPONENT
// -----------------------------
export default function MulliganModal({
  game,
  onApply,
  onClose,
}: MulliganModalProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  // The only valid replacement teams are the two teams in the game
  const currentTeams = [game.team1, game.team2].filter(
    (t): t is { team_id: string; name: string; seed: number | null } => t !== null
  );

  const handleSubmit = () => {
    if (!selectedTeam) return;
    onApply(game.game_id, selectedTeam);
  };

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/60 backdrop-blur-sm
      "
    >
      <div
        className="
          bg-slate-900 p-6 rounded-xl w-[360px]
          border border-white/10 shadow-2xl shadow-black/40
          text-slate-100 flex flex-col gap-4
        "
      >
        {/* HEADER */}
        <h2 className="text-xl font-semibold">Use Mulligan</h2>

        <p className="text-sm text-slate-300 leading-relaxed">
          Choose a new pick for this game.
        </p>

        {/* SELECT TEAM */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400">Replacement team</label>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="
              w-full px-3 py-2 rounded-md bg-slate-800 border border-white/10
              text-slate-100 text-sm focus:ring-2 focus:ring-emerald-400/40
            "
          >
            <option value="">Select a team</option>
            {currentTeams.map((team) => {
              const logo = getTeamLogo(team.name);
              return (
                <option key={team.team_id} value={team.team_id}>
                  {team.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={handleSubmit}
            disabled={!selectedTeam}
            className="
              w-full px-4 py-2 rounded-md text-white font-semibold
              bg-emerald-600 hover:bg-emerald-500
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            Apply Mulligan
          </button>

          <button
            onClick={onClose}
            className="
              w-full px-4 py-2 rounded-md text-slate-200
              bg-slate-700 hover:bg-slate-600 transition-all
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
