// app/(app)/sports/march-madness/brackets/[bracket_id]/page.tsx
import { ReadOnlyBracket } from '@/components/march-madness/ReadOnlyBracket';

export default async function BracketViewPage({
  params,
}: {
  params: { bracket_id?: string };
}) {

  console.log("BracketViewPage params:", params);

  // Normalize and validate the bracket ID
  const bracketId =
    params?.bracket_id && params.bracket_id !== 'undefined'
      ? params.bracket_id
      : null;

  if (!bracketId) {
    return (
      <div className="p-6 text-center text-red-500">
        Invalid bracket ID — please return to the leaderboard.
      </div>
    );
  }

  // Fetch bracket data
  const res = await fetch(`/api/march-madness/brackets/${bracketId}`, {
    cache: 'no-store',
  });

  // Handle API errors (404, 500, etc.)
  if (!res.ok) {
    return (
      <div className="p-6 text-center text-red-500">
        {res.status === 404
          ? 'Bracket not found — please return to the leaderboard.'
          : 'Failed to load bracket data. Please try again later.'}
      </div>
    );
  }

  const data = await res.json();

  // Defensive guard: ensure bracket object exists
  if (!data?.bracket) {
    return (
      <div className="p-6 text-center text-red-500">
        Bracket not found — Shit be broken — please return to the leaderboard.
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
