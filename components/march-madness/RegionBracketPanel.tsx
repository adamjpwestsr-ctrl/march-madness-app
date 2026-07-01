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
  const filteredGames = games.filter((g) => g.region === region);

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

  const regionAccent =
    region === 'East'
      ? 'blue'
      : region === 'West'
      ? 'yellow'
      : region === 'South'
      ? 'red'
      : 'green';

  return (
    <div className="rounded-xl p-6 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl shadow-2xl space-y-8 border border-white/10">
      <h2
        className={`text-3xl font-extrabold text-center uppercase tracking-wide text-${regionAccent}-300 drop-shadow`}
      >
        {region}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {roundOrder.map((round) => (
          <div key={round} className="space-y-4">
            <h3 className="text-lg font-bold text-center text-white/80 tracking-wide">
              {roundLabel(round)}
            </h3>

            {rounds[round].map((g) => {
              const winner = g.winner;
              const team1Name = g.team1 ?? 'TBD';
              const team2Name = g.team2 ?? 'TBD';
              const seed1 = g.seed1 ?? null;
              const seed2 = g.seed2 ?? null;

              const isTeam1Picked = winner === team1Name;
              const isTeam2Picked = winner === team2Name;

              return (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg transition-all hover:shadow-xl hover:bg-white/10"
                >
                  {/* Team 1 */}
                  <button
                    onClick={() => handlePick(g, team1Name)}
                    className={`flex justify-between items-center mb-2 w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                      ${
                        isTeam1Picked
                          ? `bg-${regionAccent}-600/40 border border-${regionAccent}-400 scale-[1.02]`
                          : 'hover:bg-white/20 hover:scale-[1.01]'
                      }
                    `}
                  >
                    <span className="text-sm opacity-70">
                      {seed1 ? `#${seed1}` : ''}
                    </span>
                    <span className="font-semibold flex items-center gap-2">
                      {team1Name}
                      {isTeam1Picked && (
                        <span className="text-green-300 font-bold">✓</span>
                      )}
                    </span>
                  </button>

                  {/* Team 2 */}
                  <button
                    onClick={() => handlePick(g, team2Name)}
                    className={`flex justify-between items-center w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                      ${
                        isTeam2Picked
                          ? `bg-${regionAccent}-600/40 border border-${regionAccent}-400 scale-[1.02]`
                          : 'hover:bg-white/20 hover:scale-[1.01]'
                      }
                    `}
                  >
                    <span className="text-sm opacity-70">
                      {seed2 ? `#${seed2}` : ''}
                    </span>
                    <span className="font-semibold flex items-center gap-2">
                      {team2Name}
                      {isTeam2Picked && (
                        <span className="text-green-300 font-bold">✓</span>
                      )}
                    </span>
                  </button>

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
