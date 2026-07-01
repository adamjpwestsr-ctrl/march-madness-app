'use client';

import { TournamentGame } from '@/lib/marchMadnessTypes';

export function RegionBracketPanel({
  region,
  games,
  onPick,
  picks = {},
}: {
  region: string;
  games: TournamentGame[];
  onPick?: (gameId: string, winner: string) => void;
  picks?: Record<string, string>;
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

  // Region accent colors + gradient themes
  const regionAccent =
    region === 'East'
      ? 'blue'
      : region === 'West'
      ? 'amber'
      : region === 'South'
      ? 'red'
      : 'emerald';

  const regionGradient =
    region === 'East'
      ? 'from-blue-900/60 to-slate-900/40'
      : region === 'West'
      ? 'from-amber-900/60 to-slate-900/40'
      : region === 'South'
      ? 'from-red-900/60 to-slate-900/40'
      : 'from-emerald-900/60 to-slate-900/40';

  return (
    <div
      className={`rounded-2xl p-6 bg-gradient-to-br ${regionGradient} backdrop-blur-xl shadow-2xl space-y-10 border border-white/10`}
    >
      {/* Region Header */}
      <h2
        className={`text-4xl font-extrabold text-center uppercase tracking-wide text-${regionAccent}-300 drop-shadow-lg`}
      >
        {region}
      </h2>

      {/* Bracket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
        {roundOrder.map((round, idx) => (
          <div key={round} className="space-y-4 relative">
            {/* Round Label */}
            <h3 className="text-lg font-bold text-center text-white/80 tracking-wide">
              {roundLabel(round)}
            </h3>

            {/* Vertical connector line */}
            {idx < roundOrder.length - 1 && (
              <div className="hidden md:block absolute top-12 right-[-20px] h-[calc(100%-2rem)] border-r border-white/10 opacity-40" />
            )}

            {/* Games */}
            {rounds[round].map((g) => {
              const team1Name = g.team1 ?? 'TBD';
              const team2Name = g.team2 ?? 'TBD';
              const seed1 = g.seed1 ?? null;
              const seed2 = g.seed2 ?? null;

              const isTeam1Picked =
                picks[g.id] === team1Name || g.winner === team1Name;
              const isTeam2Picked =
                picks[g.id] === team2Name || g.winner === team2Name;

              const isUpset =
                g.winner &&
                seed1 &&
                seed2 &&
                ((g.winner === team1Name && seed1 > seed2) ||
                  (g.winner === team2Name && seed2 > seed1));

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg transition-all duration-200 hover:shadow-2xl hover:bg-white/10"
                >
                  {/* Team 1 */}
                  <button
                    onClick={() => handlePick(g, team1Name)}
                    className={`flex justify-between items-center mb-3 w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                      ${
                        isTeam1Picked
                          ? `bg-${regionAccent}-600/40 border border-${regionAccent}-400 scale-[1.03] shadow-lg`
                          : 'hover:bg-white/20 hover:scale-[1.02]'
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
                          ? `bg-${regionAccent}-600/40 border border-${regionAccent}-400 scale-[1.03] shadow-lg`
                          : 'hover:bg-white/20 hover:scale-[1.02]'
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

                  {/* Winner + Upset Tag */}
                  {g.winner && (
                    <div className="mt-3 text-center space-y-1">
                      <div className="text-green-400 font-bold text-sm">
                        Winner: {g.winner}
                      </div>

                      {isUpset && (
                        <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                          Upset!
                        </div>
                      )}
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
