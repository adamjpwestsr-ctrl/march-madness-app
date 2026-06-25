'use client';

import { useState } from 'react';

export default function NewBracketPage() {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🔥');
  const [tiebreaker, setTiebreaker] = useState('');

  async function createBracket() {
    await fetch('/api/march-madness/brackets', {
      method: 'POST',
      body: JSON.stringify({
        bracket_name: name,
        icon,
        tiebreaker_score: Number(tiebreaker),
      }),
    });
    window.location.href = '/sports/march-madness/brackets';
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Create New Bracket</h1>

      <input
        className="p-2 rounded bg-white/10 w-full"
        placeholder="Bracket Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="p-2 rounded bg-white/10 w-full"
        placeholder="Icon (emoji)"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
      />

      <input
        className="p-2 rounded bg-white/10 w-full"
        placeholder="Championship Game Total Score"
        value={tiebreaker}
        onChange={(e) => setTiebreaker(e.target.value)}
      />

      <button
        onClick={createBracket}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Create Bracket
      </button>
    </div>
  );
}
