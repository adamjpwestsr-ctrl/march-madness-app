// app/(app)/sports/march-madness/brackets/[id]/page.tsx

import { ReadOnlyBracket } from '@/components/march-madness/ReadOnlyBracket';

export default async function BracketViewPage({ params }: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/march-madness/brackets/${params.id}`,
    { cache: 'no-store' }
  );

  const data = await res.json();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{data.bracket.bracket_name}</h1>

        <a
          href={`/sports/march-madness/brackets/${params.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Edit Bracket
        </a>
      </div>

      <ReadOnlyBracket games={[...data.openingRoundGames, ...Object.values(data.regionalGames).flat()]} />
    </div>
  );
}
