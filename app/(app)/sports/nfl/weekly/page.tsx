import WeeklyClient from "./WeeklyClient";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function WeeklyPage({ searchParams }: any) {
  const supabase = await createSupabaseServerClient();

  // Load all NFL games once
  const { data: allGames, error: allGamesError } = await supabase
    .from("sport_schedule")
    .select("id,home_team_id,away_team_id,week_number,game_date")
    .eq("sport", "NFL")
    .order("game_date", { ascending: true });

  if (allGamesError || !allGames) {
    return (
      <div className="text-white p-6">
        <h1 className="text-xl font-semibold">NFL Weekly Pick’em</h1>
        <p className="text-red-400 mt-2">Failed to load schedule.</p>
      </div>
    );
  }

  // -----------------------------
  // SMART WEEK DETECTOR
  // -----------------------------
  const now = new Date();

  // Find first game that hasn't started yet
  const upcoming = allGames.find((g) => new Date(g.game_date) > now);

  // If user selected a week manually via ?week=#
  const selectedWeek = searchParams?.week
    ? Number(searchParams.week)
    : null;

  // Final week selection logic
  const week =
    selectedWeek ??
    upcoming?.week_number ??
    allGames[allGames.length - 1].week_number;

  // -----------------------------
  // Load ONLY games for this week
  // -----------------------------
  const games = allGames.filter((g) => g.week_number === week);

  // Collect team IDs
  const teamIds = Array.from(
    new Set(games.flatMap((g) => [g.home_team_id, g.away_team_id]))
  );

  // Load team data
  const { data: teams, error: teamsError } = await supabase
    .from("teams_sports")
    .select("id,name,abbreviation,logo_url")
    .in("id", teamIds);

  if (teamsError || !teams) {
    return (
      <div className="text-white p-6">
        <h1 className="text-xl font-semibold">NFL Weekly Pick’em</h1>
        <p className="text-red-400 mt-2">Failed to load teams.</p>
      </div>
    );
  }

  // Build lookup map
  const teamsById: Record<string, any> = {};
  teams.forEach((t) => {
    teamsById[t.id] = t;
  });

  // Compute lock time (earliest game)
  const lockTime =
    games.length > 0
      ? games.reduce<string | null>((min, g) => {
          const d = g.game_date as string;
          if (!min) return d;
          return new Date(d) < new Date(min) ? d : min;
        }, null)
      : null;

  // Patch missing fields for WeeklyGame type
  const patchedGames = games.map((g) => ({
    ...g,
    sport: "NFL",
    season_year: new Date().getFullYear(),
  }));

  // -----------------------------
  // WEEK SELECTOR + NAV BAR DATA
  // -----------------------------
  const allWeeks = Array.from(
    new Set(allGames.map((g) => g.week_number))
  ).sort((a, b) => a - b);

  const prevWeek = allWeeks.includes(week - 1) ? week - 1 : null;
  const nextWeek = allWeeks.includes(week + 1) ? week + 1 : null;

  return (
    <div className="min-h-screen text-white p-6">
      <WeeklyClient
        sport="NFL"
        week={week}
        games={patchedGames}
        teamsById={teamsById}
        lockTime={lockTime}
        allWeeks={allWeeks}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
      />
    </div>
  );
}
