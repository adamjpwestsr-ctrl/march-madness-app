'use client';

import { TournamentGame } from '@/lib/marchMadnessTypes';

export function RegionBracketPanel({
  region,
  games,
}: {
  region: string;
  games: TournamentGame[];
}) {
  // Group games by round
  const rounds: Record<number, TournamentGame[]> = {};
  games.forEach((g) => {
    const r = g.round ?? 0;
    if (!rounds[r]) rounds[r] = [];
    rounds[r].push(g);
  });

  const roundOrder = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

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

            {rounds[round].map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/20 transition-all"
              >
                {/* Team 1 */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm opacity-70">
                    {g.seed1 ? `#${g.seed1}` : ''}
                  </span>
                  <span className="font-semibold">
                    {g.team1 ?? 'TBD'}
                  </span>
                </div>

                {/* Team 2 */}
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">
                    {g.seed2 ? `#${g.seed2}` : ''}
                  </span>
                  <span className="font-semibold">
                    {g.team2 ?? 'TBD'}
                  </span>
                </div>

                {/* Winner */}
                {g.winner && (
                  <div className="mt-2 text-green-400 font-bold text-sm text-center">
                    Winner: {g.winner}
                  </div>
                )}
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
