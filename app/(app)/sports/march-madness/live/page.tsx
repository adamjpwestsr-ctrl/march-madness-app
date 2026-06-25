export default async function LivePage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/march-madness/live`,
    { cache: 'no-store' }
  );
  const live = await res.json();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Live Games</h1>

      {live.map((g: any) => (
        <div key={g.game_id} className="p-4 bg-white/10 rounded-xl">
          <div className="font-semibold">{g.home_team} vs {g.away_team}</div>
          <div className="text-xl font-bold">
            {g.home_score} - {g.away_score}
          </div>
          <div className="opacity-70">{g.status}</div>
        </div>
      ))}
    </div>
  );
}
