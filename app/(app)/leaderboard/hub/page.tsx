import Link from "next/link";

export default function LeaderboardHub() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold mb-2">Leaderboards</h1>
        <p className="text-slate-400">
          Track your performance across all BracketBoss challenges.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/sports/nfl/weekly/leaderboard" className="block">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800">
            <h2 className="text-xl font-semibold mb-2">NFL Weekly</h2>
            <p className="text-slate-400">Weekly picks leaderboard</p>
          </div>
        </Link>

        <Link href="/sports/golf/weekly/leaderboard" className="block">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800">
            <h2 className="text-xl font-semibold mb-2">Golf Weekly</h2>
            <p className="text-slate-400">PGA weekly leaderboard</p>
          </div>
        </Link>

        <Link href="/trivia/leaderboard" className="block">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800">
            <h2 className="text-xl font-semibold mb-2">Trivia</h2>
            <p className="text-slate-400">Daily + weekly trivia leaderboard</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
