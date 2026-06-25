'use client';

import Link from 'next/link';

export function BracketCard({
  bracket,
}: {
  bracket: {
    bracket_id: string;
    bracket_name: string;
    icon?: string | null;
    tiebreaker_score?: number | null;
    submitted?: boolean;
  };
}) {
  return (
    <Link
      href={`/sports/march-madness/brackets/${bracket.bracket_id}`}
      className="block p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{bracket.icon ?? '🏀'}</div>
          <div>
            <div className="text-lg font-semibold">{bracket.bracket_name}</div>
            <div className="text-sm opacity-70">
              Tiebreaker: {bracket.tiebreaker_score ?? '—'}
            </div>
          </div>
        </div>

        {bracket.submitted ? (
          <span className="px-3 py-1 text-xs rounded bg-green-600 text-white">
            Submitted
          </span>
        ) : (
          <span className="px-3 py-1 text-xs rounded bg-yellow-500 text-black">
            In Progress
          </span>
        )}
      </div>
    </Link>
  );
}
