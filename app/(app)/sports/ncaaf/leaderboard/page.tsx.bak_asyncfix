import NcaafLeaderboardTable from "@/app/components/ncaaf/NcaafLeaderboardTable";

export default async async function NcaafLeaderboardPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ncaaf/leaderboard`, {
    cache: "no-store",
  });

  const rows = await res.json();

  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">NCAA Football Leaderboard</h1>
        <p className="text-slate-400">
          Track weekly points and season standings across all NCAA Football pick modes.
        </p>
      </section>

      <NcaafLeaderboardTable rows={rows} />
    </div>
  );
}
