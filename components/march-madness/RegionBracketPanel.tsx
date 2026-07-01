'use client';

import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';

export function RegionBracketPanel({
  region,
  games,
  onPick,
  picks = {},
  teams,
}: {
  region: string;
  games: TournamentGame[];
  onPick?: (gameId: string, winner: string) => void;
  picks?: Record<string, string>;
  teams: TournamentTeam[];
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
        {roundOrder.map((round, idx) => {
          const nextRoundExists = idx < roundOrder.length - 1;

          return (
            <div key={round} className="space-y-4 relative">
              {/* Round Label */}
              <h3 className="text-lg font-bold text-center text-white/80 tracking-wide">
                {roundLabel(round)}
              </h3>

              {/* Vertical connector line between columns */}
              {nextRoundExists && (
                <div className="hidden md:block absolute top-12 right-[-20px] h-[calc(100%-2rem)] border-r border-white/10 opacity-40" />
              )}

              {/* Games */}
              {rounds[round].map((g) => {
                const seed1 = g.seed1 ?? null;
                const seed2 = g.seed2 ?? null;

                const team1Name = g.team1 ?? 'TBD';
                const team2Name = g.team2 ?? 'TBD';

                const team1Obj = teams.find((t) => t.id === g.team1_id);
                const team2Obj = teams.find((t) => t.id === g.team2_id);

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

                // ------------------------------------------------------------
                // STEP 4: PLACEHOLDER GAME HANDLING
                // ------------------------------------------------------------
                if (g.is_placeholder) {
                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-white/10 text-center text-white/50 shadow-lg"
                    >
                      Placeholder Game
                    </div>
                  );
                }

                // ------------------------------------------------------------
                // STEP 2: ROUND OF 64 VISIBILITY LOGIC
                // ------------------------------------------------------------
                const team1NeedsOpening = seed1 !== null && seed1 >= 17;
                const team2NeedsOpening = seed2 !== null && seed2 >= 17;

                const waitingOnOpeningRound =
                  (team1NeedsOpening || team2NeedsOpening) && !g.winner;

                if (round === 2 && waitingOnOpeningRound) {
                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-white/60 shadow-lg"
                    >
                      Awaiting Opening Round Winner…
                    </div>
                  );
                }

                // ------------------------------------------------------------
                // STEP 6: CLASSIC NCAA CONNECTORS
                // ------------------------------------------------------------

                // ACTIVE LOGIC: Sequential game_number pairing
                const isTopSibling = g.game_number % 2 === 1;

                // COMMENTED OUT: Custom pairing logic
                //
                // const customPairMap: Record<string, string> = {
                //   'game-id-1': 'game-id-2',
                //   'game-id-3': 'game-id-4',
                //   ...
                // };
                //
                // const isTopSibling_ALT = customPairMap[g.id] !== undefined;
                //
                // Use this instead:
                // const isTopSibling = isTopSibling_ALT;

                return (
                  <div
                    key={g.id}
                    className="relative p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg transition-all duration-200 hover:shadow-2xl hover:bg-white/10"
                  >
                    {/* Horizontal connector */}
                    {nextRoundExists && (
                      <div className="hidden md:block absolute right-[-24px] top-1/2 w-6 border-t border-white/20"></div>
                    )}

                    {/* Vertical connector (only for top sibling) */}
                    {nextRoundExists && isTopSibling && (
                      <div className="hidden md:block absolute right-[-24px] top-0 bottom-0 border-r border-white/20"></div>
                    )}

                    {/* Team 1 */}
                    <button
                      onClick={() => handlePick(g, team1Name)}
                      className={`
                        flex flex-wrap items-center justify-between gap-3
                        whitespace-normal leading-tight min-h-[52px]
                        w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                        ${
                          isTeam1Picked
                            ? `bg-${regionAccent}-600/40 border border-${regionAccent}-400 scale-[1.03] shadow-lg`
                            : 'hover:bg-white/20 hover:scale-[1.02]'
                        }
                      `}
                    >
                      {team1Obj?.logo_url && (
                        <img
                          src={team1Obj.logo_url}
                          alt={team1Name}
                          className="w-6 h-6 rounded-sm object-contain"
                        />
                      )}

                      <span className="flex flex-col flex-wrap items-start gap-1 whitespace-normal leading-tight">
                        <span className="font-semibold">{team1Name}</span>

                        {seed1 && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/20">
                            #{seed1}
                          </span>
                        )}
                      </span>

                      {isTeam1Picked && (
                        <span className="text-green-300 font-bold text-lg">✓</span>
                      )}
                    </button>

                    {/* Team 2 */}
                    <button
                      onClick={() => handlePick(g, team2Name)}
                      className={`
                        flex flex-wrap items-center justify-between gap-3
                        whitespace-normal leading-tight min-h-[52px]
                        w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                        ${
                          isTeam2Picked
                            ? `bg-${regionAccent}-600/40 border border-${regionAccent}-400 scale-[1.03] shadow-lg`
                            : 'hover:bg-white/20 hover:scale-[1.02]'
                        }
                      `}
                    >
                      {team2Obj?.logo_url && (
                        <img
                          src={team2Obj.logo_url}
                          alt={team2Name}
                          className="w-6 h-6 rounded-sm object-contain"
                        />
                      )}

                      <span className="flex flex-col flex-wrap items-start gap-1 whitespace-normal leading-tight">
                        <span className="font-semibold">{team2Name}</span>

                        {seed2 && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/20">
                            #{seed2}
                          </span>
                        )}
                      </span>

                      {isTeam2Picked && (
                        <span className="text-green-300 font-bold text-lg">✓</span>
                      )}
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
          );
        })}
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
