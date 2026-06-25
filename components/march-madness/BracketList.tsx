'use client';

import { BracketCard } from './BracketCard';
import { useState } from 'react';

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
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const res = await fetch('/api/march-madness/brackets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bracket_name: 'My Bracket',
          icon: '🏀',
          tiebreaker_score: 120,
        }),
      });
      const json = await res.json();
      console.log('Created bracket:', json);
      window.location.reload();
    } catch (err) {
      console.error('Error creating bracket:', err);
    } finally {
      setCreating(false);
    }
  };

  if (!brackets || brackets.length === 0) {
    return (
      <div className="p-6 text-center opacity-70 space-y-4">
        <p>You haven’t created any brackets yet.</p>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {creating ? 'Creating…' : 'Create Bracket'}
        </button>
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
