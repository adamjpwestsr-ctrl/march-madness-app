// app/(app)/sports/march-madness/brackets/[bracket_id]/page.tsx

'use client';

import { useEffect, useState } from 'react';

export default function BracketPage({ params }: { params: { bracket_id: string } }) {
  const bracketId = params.bracket_id;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-6">Loading bracket data…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Bracket Loaded ✅</h1>
      <p>Bracket ID: {bracketId}</p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded">
        {JSON.stringify(data.bracket, null, 2)}
      </pre>
    </div>
  );
}
