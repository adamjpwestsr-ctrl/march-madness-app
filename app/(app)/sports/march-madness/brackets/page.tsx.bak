export default async function BracketsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/march-madness/bracket-list`, {
    cache: 'no-store',
  });
  const brackets = await res.json();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Your Brackets</h1>

      <a
        href="/sports/march-madness/brackets/new"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Create New Bracket
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {brackets.map((b: any) => (
          <a
            key={b.bracket_id}
            href={`/sports/march-madness/brackets/${b.bracket_id}`}
            className="p-4 bg-white/10 rounded-xl shadow"
          >
            <div className="text-xl font-semibold">{b.bracket_name}</div>
            <div className="opacity-70">Tiebreaker: {b.tiebreaker_score}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

