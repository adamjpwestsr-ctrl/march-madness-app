'use client';

import { useEffect, useState } from 'react';
import { ReadOnlyBracket } from '@/components/march-madness/ReadOnlyBracket';

export default function BracketViewPage({ params }: { params: { bracket_id?: string } }) {
  const [bracketId, setBracketId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveParams() {
      try {
        const resolved = await Promise.resolve(params);
        const id = resolved?.bracket_id;
        if (!id) throw new Error('No bracket_id found in params');
        setBracketId(id);
      } catch (err: any) {
        setError(err.message);
      }
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!bracketId) return;

    async function load() {
      try {
        const res = await fetch(`/api/march-madness/brackets/${bracketId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      }
    }

    load();
  }, [bracketId]);

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-6 text-center">Loading bracket data…</div>;
  }

  if (!data?.bracket) {
    return (
      <div className="p-6 text-center text-red-500">
        Bracket not found — please return to the leaderboard.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{data.bracket.bracket_name}</h1>

        <a
          href={`/sports/march-madness/brackets/${bracketId}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Edit Bracket
        </a>
      </div>

      <ReadOnlyBracket
        games={[
          ...data.openingRoundGames,
          ...Object.values(data.regionalGames).flat(),
        ]}
      />
    </div>
  );
}
