export default async function LeaderboardPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/march-madness/leaderboard`,
    { cache: 'no-store' }
  );
  const leaderboard = await res.json();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <div className="space-y-2">
        {leaderboard.map((row: any, i: number) => (
          <div
            key={row.bracket_id}
            className="p-4 bg-white/10 rounded-xl flex justify-between"
          >
            <div>
              <div className="font-semibold">{i + 1}. {row.bracket_name}</div>
              <div className="opacity-70">Max: {row.max_possible_score}</div>
            </div>
            <div className="text-xl font-bold">{row.earned_points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
