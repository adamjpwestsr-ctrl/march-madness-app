'use client';

import { TournamentGame } from '@/lib/marchMadnessTypes';

export function RegionBracketPanel({
  region,
  games,
  onPick,
}: {
  region: string;
  games: TournamentGame[];
  onPick?: (gameId: string, winner: string) => void;
}) {
  // Filter games by region
  const filteredGames = games.filter((g) => g.region === region);

  // Group games by round
  const rounds: Record<number, TournamentGame[]> = {};
  filteredGames.forEach((g) => {
    const r = g.round ?? 0;
    if (!rounds[r]) rounds[r] = [];
    rounds[r].push(g);
  });

  const roundOrder = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  const handlePick = (game: TournamentGame, winner: string) => {
    if (!winner || winner === 'TBD') return;
    if (onPick) onPick(game.id, winner);
  };

  return (
    <div className="rounded-xl p-6 bg-white/10 backdrop-blur-xl shadow-xl space-y-8">
      {/* Region Header */}
      <h2 className="text-2xl font-bold text-center uppercase tracking-wide text-white/90">
        {region}
      </h2>

      {/* Bracket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {roundOrder.map((round) => (
          <div key={round} className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-200">
              {roundLabel(round)}
            </h3>

            {rounds[round].map((g) => {
              const winner = g.winner;

              const team1Name = g.team1_id ? g.team1 ?? g.team1_id : g.team1 ?? 'TBD';
              const team2Name = g.team2_id ? g.team2 ?? g.team2_id : g.team2 ?? 'TBD';

              const seed1 = g.seed1 ?? null;
              const seed2 = g.seed2 ?? null;

              return (
                <div
                  key={g.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 transition-all"
                >
                  {/* Team 1 */}
                  <button
                    onClick={() => handlePick(g, team1Name)}
                    className={`flex justify-between items-center mb-1 w-full text-left px-2 py-1 rounded-md transition
                      ${
                        winner === team1Name
                          ? 'bg-green-600/30 border border-green-400'
                          : 'hover:bg-white/20'
                      }
                    `}
                  >
                    <span className="text-sm opacity-70">
                      {seed1 ? `#${seed1}` : ''}
                    </span>
                    <span className="font-semibold">{team1Name}</span>
                  </button>

                  {/* Team 2 */}
                  <button
                    onClick={() => handlePick(g, team2Name)}
                    className={`flex justify-between items-center w-full text-left px-2 py-1 rounded-md transition
                      ${
                        winner === team2Name
                          ? 'bg-green-600/30 border border-green-400'
                          : 'hover:bg-white/20'
                      }
                    `}
                  >
                    <span className="text-sm opacity-70">
                      {seed2 ? `#${seed2}` : ''}
                    </span>
                    <span className="font-semibold">{team2Name}</span>
                  </button>

                  {/* Winner */}
                  {winner && (
                    <div className="mt-2 text-green-400 font-bold text-sm text-center">
                      Winner: {winner}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function roundLabel(round: number) {
  switch (round) {
    case 1:
      return 'Opening Round';
    case 2:
      return 'Round of 64';
    case 3:
      return 'Round of 32';
    case 4:
      return 'Sweet 16';
    case 5:
      return 'Elite 8';
    case 6:
      return 'Final Four';
    case 7:
      return 'Championship';
    default:
      return `Round ${round}`;
  }
}
