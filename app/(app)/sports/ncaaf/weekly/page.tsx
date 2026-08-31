import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function NcaafWeeklyLanding() {
  const supabase = await createSupabaseServerClient();

  const seasonYear = new Date().getFullYear();

  // Load all games for the season
  const { data: allGames } = await supabase
    .from("ncaaf_games")
    .select("week, start_time, home_team_id, away_team_id")
    .eq("season_year", seasonYear)
    .order("start_time", { ascending: true });

  if (!allGames || allGames.length === 0) {
    return (
      <div className="min-h-screen text-white p-10">
        <h1 className="text-3xl font-bold">NCAAF Weekly Pick’em</h1>
        <p className="text-red-400 mt-4">No schedule found.</p>
      </div>
    );
  }

  // Determine current week
  const now = new Date();
  const upcoming = allGames.find((g) => new Date(g.start_time) > now);

  const week =
    upcoming?.week ??
    allGames[allGames.length - 1]?.week ??
    1;

  // Load games for this week
  const weeklyGames = allGames.filter((g) => g.week === week);

  const teamIds = Array.from(
    new Set(weeklyGames.flatMap((g) => [g.home_team_id, g.away_team_id]))
  );

  const { data: teams } = await supabase
    .from("ncaaf_teams")
    .select("*")
    .in("id", teamIds);

  const teamsById: Record<string, any> = {};
  teams?.forEach((t) => (teamsById[t.id] = t));

  const lockTime =
    weeklyGames.length > 0
      ? weeklyGames.reduce<string | null>((min, g) => {
          const d = g.start_time as string;
          if (!min) return d;
          return new Date(d) < new Date(min) ? d : min;
        }, null)
      : null;

  const allWeeks = Array.from(new Set(allGames.map((g) => g.week))).sort(
    (a, b) => a - b
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* HERO */}
      <section className="relative px-6 py-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          NCAAF Weekly Pick’em
        </h1>
        <p className="text-slate-400 text-lg">
          Season {seasonYear} • Week {week}
        </p>

        {lockTime && (
          <p className="text-yellow-400 mt-3 text-sm">
            Picks lock at {new Date(lockTime).toLocaleString()}
          </p>
        )}

        <div className="mt-10">
          <Link
            href={`/sports/ncaaf/${seasonYear}/week/${week}`}
            className="inline-block px-8 py-4 rounded-xl bg-yellow-500 text-black font-bold text-lg shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all"
          >
            Enter Week {week} Picks
          </Link>
        </div>
      </section>

      {/* WEEK SELECTOR */}
      <section className="px-6 py-8">
        <h2 className="text-xl font-semibold mb-4">Select Week</h2>
        <div className="flex flex-wrap gap-3">
          {allWeeks.map((w) => (
            <Link
              key={w}
              href={`/sports/ncaaf/${seasonYear}/week/${w}`}
              className={`px-4 py-2 rounded-lg border border-white/10 ${
                w === week
                  ? "bg-yellow-500 text-black font-bold"
                  : "bg-slate-800/40 text-slate-300 hover:bg-slate-700/40"
              } transition-all`}
            >
              Week {w}
            </Link>
          ))}
        </div>
      </section>

      {/* MATCHUP PREVIEW */}
      <section className="px-6 py-10">
        <h2 className="text-xl font-semibold mb-6">This Week’s Matchups</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {weeklyGames.map((g) => {
            const home = teamsById[g.home_team_id];
            const away = teamsById[g.away_team_id];

            return (
              <div
                key={g.start_time + g.home_team_id}
                className="group rounded-xl bg-slate-900/40 border border-white/10 p-5 shadow-md hover:shadow-xl hover:bg-slate-800/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={home.logo_url}
                      className="w-12 h-12 rounded-lg shadow"
                    />
                    <span className="text-white font-semibold text-lg">
                      {home.name}
                    </span>
                  </div>
                </div>

                <div className="text-center text-slate-400 my-3 text-sm">
                  vs
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={away.logo_url}
                      className="w-12 h-12 rounded-lg shadow"
                    />
                    <span className="text-white font-semibold text-lg">
                      {away.name}
                    </span>
                  </div>
                </div>

                <div className="text-slate-400 text-xs mt-4">
                  {new Date(g.start_time).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
