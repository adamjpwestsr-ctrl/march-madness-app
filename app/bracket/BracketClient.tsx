"use client";

import { useState, useEffect } from "react";

export default function BracketClient({
  bracket,
  picks,
  games,
  onPick,
}: {
  bracket: any;
  picks: any[];
  games: any[];
  onPick: (gameId: string, teamId: string) => void;
}) {
  const [localPicks, setLocalPicks] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    picks.forEach((p) => {
      map[p.game_id] = p.team_id;
    });
    setLocalPicks(map);
  }, [picks]);

  const handlePick = (gameId: string, teamId: string) => {
    setLocalPicks((prev) => ({ ...prev, [gameId]: teamId }));
    onPick(gameId, teamId);
  };

  // Group games by round + region
  const rounds = {
    R64: games.filter((g) => g.round === 1),
    R32: games.filter((g) => g.round === 2),
    S16: games.filter((g) => g.round === 3),
    E8: games.filter((g) => g.round === 4),
    F4: games.filter((g) => g.round === 5),
    FINALS: games.filter((g) => g.round === 6),
  };

  const regions = ["East", "West", "South", "Midwest"];

  const renderGame = (game: any) => {
    const pick = localPicks[game.game_id];

    return (
      <div className="bg-slate-800 p-2 rounded-lg shadow text-sm flex flex-col gap-2">
        {[game.team1, game.team2].map((team: any) => {
          if (!team) return null;

          const isPicked = pick === team.team_id;

          return (
            <button
              key={team.team_id}
              onClick={() => handlePick(game.game_id, team.team_id)}
              className={`flex items-center justify-between px-2 py-1 rounded 
                ${
                  isPicked
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
            >
              <span className="opacity-80">{team.seed}</span>
              <span className="flex-1 text-left ml-2">{team.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderRoundColumn = (roundGames: any[]) => (
    <div className="flex flex-col gap-4 w-56">{roundGames.map(renderGame)}</div>
  );

  return (
    <div className="overflow-x-auto pb-10">
      <div className="min-w-[1800px] flex gap-12 p-4">
        {/* LEFT SIDE REGIONS */}
        {regions.map((region) => (
          <div key={region} className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-center">{region}</h2>

            <div className="flex gap-6">
              {renderRoundColumn(
                rounds.R64.filter((g) => g.region === region)
              )}
              {renderRoundColumn(
                rounds.R32.filter((g) => g.region === region)
              )}
              {renderRoundColumn(
                rounds.S16.filter((g) => g.region === region)
              )}
              {renderRoundColumn(
                rounds.E8.filter((g) => g.region === region)
              )}
            </div>
          </div>
        ))}

        {/* FINAL FOUR + CHAMPIONSHIP */}
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-xl font-bold text-center">Final Four</h2>

          <div className="flex gap-6">
            {renderRoundColumn(rounds.F4)}
            {renderRoundColumn(rounds.FINALS)}
          </div>
        </div>
      </div>
    </div>
  );
}
