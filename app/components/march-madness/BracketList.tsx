'use client';

import { BracketCard } from './BracketCard';

export function BracketList({
  brackets,
}: {
  brackets: {
    bracket_id: string;
    bracket_name: string;
    icon?: string | null;
    tiebreaker_score?: number | null;
    submitted?: boolean;
  }[];
}) {
  if (!brackets || brackets.length === 0) {
    return (
      <div className="p-6 text-center opacity-70">
        You haven’t created any brackets yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {brackets.map((b) => (
        <BracketCard key={b.bracket_id} bracket={b} />
      ))}
    </div>
  );
}
