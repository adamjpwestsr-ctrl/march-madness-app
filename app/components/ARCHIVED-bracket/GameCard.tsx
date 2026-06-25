"use client";

import { getTeamLogo } from "@/lib/getTeamLogo";

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

export default function GameCard({ game }: { game: Game }) {
  const { team1, team2, winner } = game;

  return (
    <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <TeamRow team={team1} isWinner={winner === team1?.team_id} />
      <TeamRow team={team2} isWinner={winner === team2?.team_id} />
    </div>
  );
}

function TeamRow({
  team,
  isWinner,
}: {
  team: Team | null;
  isWinner: boolean;
}) {
  if (!team) {
    return (
      <div className="px-3 py-2 bg-slate-800/40 rounded-lg text-slate-500 text-sm italic">
        TBD
      </div>
    );
  }

  const logo = getTeamLogo(team.name);

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg ${
        isWinner
          ? "bg-cyan-500/20 border border-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
          : "bg-slate-800/40"
      }`}
    >
      <div className="flex items-center gap-3">
        {logo && (
          <img
            src={logo}
            alt={team.name}
            className="w-6 h-6 rounded-full object-cover border border-slate-700"
          />
        )}

        <span
          className={`text-xs px-2 py-1 rounded-md ${
            isWinner
              ? "bg-cyan-500/30 text-cyan-200"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {team.seed ?? "-"}
        </span>

        <span className="font-semibold text-sm">{team.name}</span>
      </div>

      <span className="font-bold text-lg">-</span>
    </div>
  );
}
