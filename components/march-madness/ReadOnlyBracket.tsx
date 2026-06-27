'use client';

import { TournamentGame } from '@/lib/marchMadnessTypes';

export function ReadOnlyBracket({ games }: { games: TournamentGame[] }) {
  // -----------------------------
  // GROUP BY ROUND + REGION
  // -----------------------------
  const grouped: Record<number, Record<string, TournamentGame[]>> = {};

  games.forEach((g) => {
    const round = g.round ?? 0;
    const region = g.region ?? 'Unknown';

    if (!grouped[round]) grouped[round] = {};
    if (!grouped[round][region]) grouped[round][region] = [];

    grouped[round][region].push(g);
  });

  const roundOrder = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="rounded-xl p-6 bg-white/10 backdrop-blur-xl shadow-xl space-y-10">
      <h2 className="text-2xl font-bold">Bracket</h2>

      {/* -----------------------------
          BRACKET GRID
      ------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {roundOrder.map((round) => (
          <div key={round} className="space-y-6">
            <h3 className="text-lg font-semibold text-center">
              {roundLabel(round)}
            </h3>

            {Object.keys(grouped[round]).map((region) => (
              <div key={region} className="space-y-4">
                <h4 className="text-sm text-center text-gray-300">
                  {region}
                </h4>

                {grouped[round][region].map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    {/* Team 1 */}
                    <div
                      className={`p-2 rounded mb-2 ${
                        g.winner === g.team1
                          ? 'bg-green-600 text-white font-bold'
                          : 'bg-white/10'
                      }`}
                    >
                      {g.team1 ?? 'TBD'}
                    </div>

                    {/* Team 2 */}
                    <div
                      className={`p-2 rounded ${
                        g.winner === g.team2
                          ? 'bg-green-600 text-white font-bold'
                          : 'bg-white/10'
                      }`}
                    >
                      {g.team2 ?? 'TBD'}
                    </div>

                    {/* Winner */}
                    {g.winner && (
                      <div className="mt-2 text-green-400 font-bold text-sm">
                        Winner: {g.winner}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function roundLabel(round: number) {
  switch (round) {
    case 1: return 'Opening Round';
    case 2: return 'Round of 64';
    case 3: return 'Round of 32';
    case 4: return 'Sweet 16';
    case 5: return 'Elite 8';
    case 6: return 'Final Four';
    case 7: return 'Championship';
    default: return `Round ${round}`;
  }
}
