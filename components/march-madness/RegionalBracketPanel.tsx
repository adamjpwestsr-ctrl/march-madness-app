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
    .map((r) => Number(r))
    .sort((a, b) => a - b);

  return (
    <div className="rounded-xl p-6 bg-white/10 backdrop-blur-xl shadow-xl space-y-6">
      <h2 className="text-2xl font-bold">{region}</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roundOrder.map((round) => (
          <div key={round} className="space-y-4">
            <h3 className="text-lg font-semibold text-center">
              {roundLabel(round)}
            </h3>

            {rounds[round].map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/20 transition-all"
              >
                <div className="font-semibold">
                  {g.team1 ?? 'TBD'} vs {g.team2 ?? 'TBD'}
                </div>

                {g.winner && (
                  <div className="mt-1 text-green-400 font-bold">
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
      return 'Round of 64';
    case 2:
      return 'Round of 32';
    case 3:
      return 'Sweet 16';
    case 4:
      return 'Elite 8';
    case 5:
      return 'Final Four';
    case 6:
      return 'Championship';
    default:
      return `Round ${round}`;
  }
}
