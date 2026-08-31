import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getWeeklyGames } from "@/lib/ncaaf/getWeeklyGames";
import PicksShell from "@/components/ncaaf/PicksShell";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function NcaafWeeklyPage({ params }) {
  const supabase = await createSupabaseServerClient();

  const year = Number(params.year);
  const week = Number(params.week);

  // Load user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load games for this week (joined with teams)
  const games = await getWeeklyGames(year, week);

  if (!games || games.length === 0) {
    return (
      <div className="min-h-screen text-white p-6">
        <h1 className="text-xl font-semibold">NCAAF Week {week}</h1>
        <p className="text-red-400 mt-2">No games found for this week.</p>
      </div>
    );
  }

  // Determine lock time (earliest game start)
  const lockTime =
    games.length > 0
      ? games.reduce<string | null>((min, g) => {
          const d = g.start_time as string;
          if (!min) return d;
          return new Date(d) < new Date(min) ? d : min;
        }, null)
      : null;

  return (
    <div className="min-h-screen text-white p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">NCAAF Week {week}</h1>
        <p className="text-slate-400">Season {year}</p>
        {lockTime && (
          <p className="text-yellow-400 text-sm mt-1">
            Picks lock at {new Date(lockTime).toLocaleString()}
          </p>
        )}
      </header>

      <PicksShell
        games={games}
        userId={user?.id ?? null}
        seasonYear={year}
        week={week}
        lockTime={lockTime}
      />
    </div>
  );
}
