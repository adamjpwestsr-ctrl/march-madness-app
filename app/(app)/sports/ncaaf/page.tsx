// app/(app)/sports/ncaaf/weekly/page.tsx

import WeeklyClient from "./weekly/WeeklyClient";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function NcaafWeeklyPage() {
  const supabase = await createSupabaseServerClient();

  const seasonYear = new Date().getFullYear();

  // TODO: later: detect current week from API or config
  const currentWeek = 1;

  // Load all games for this season
  const { data: allGames, error: gamesError } = await supabase
    .from("ncaaf_games")
    .select("*")
    .eq("season_year", seasonYear)
    .order("start_time", { ascending: true });

  if (gamesError || !allGames) {
    return (
      <div className="min-h-screen text-white p-6">
        <h1 className="text-xl font-semibold">NCAAF Weekly Pick’em</h1>
        <p className="text-red-400 mt-2">Failed to load schedule.</p>
      </div>
    );
  }

  // Smart week detector
  const now = new Date();
  const upcoming = allGames.find((g) => new Date(g.start_time) > now);

  const week =
    upcoming?.week ??
    allGames[allGames.length - 1]?.week ??
    currentWeek;

  const games = allGames.filter((g) => g.week === week);

  const teamIds = Array.from(
    new Set(games.flatMap((g) => [g.home_team_id, g.away_team_id]))
  );

  const { data: teams, error: teamsError } = await supabase
    .from("ncaaf_teams")
    .select("id,name,abbreviation,logo_url,conference")
    .in("id", teamIds);

  if (teamsError || !teams) {
    return (
      <div className="min-h-screen text-white p-6">
        <h1 className="text-xl font-semibold">NCAAF Weekly Pick’em</h1>
        <p className="text-red-400 mt-2">Failed to load teams.</p>
      </div>
    );
  }

  const teamsById: Record<string, any> = {};
  teams.forEach((t) => {
    teamsById[t.id] = t;
  });

  const lockTime =
    games.length > 0
      ? games.reduce<string | null>((min, g) => {
          const d = g.start_time as string;
          if (!min) return d;
          return new Date(d) < new Date(min) ? d : min;
        }, null)
      : null;

  const allWeeks = Array.from(
    new Set(allGames.map((g) => g.week))
  ).sort((a, b) => a - b);

  const prevWeek = allWeeks.includes(week - 1) ? week - 1 : null;
  const nextWeek = allWeeks.includes(week + 1) ? week + 1 : null;

  return (
    <div className="min-h-screen text-white p-6">
      <WeeklyClient
        seasonYear={seasonYear}
        week={week}
        games={games}
        teamsById={teamsById}
        lockTime={lockTime}
        allWeeks={allWeeks}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
      />
    </div>
  );
}
