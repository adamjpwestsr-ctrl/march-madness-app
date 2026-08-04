import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async async function POST() {
  const supabase = await createSupabaseServerClient();

  const url =
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard";

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const events = data?.events ?? [];

    const rows = events.map((e: any) => {
      const comp = e.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
      const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

      return {
        espn_game_id: e.id,
        season: data.season?.year ?? new Date().getFullYear(),
        week: data.week?.number ?? 1,
        start_time: e.date,
        home_team_id: home?.id,
        home_team_name: home?.team?.displayName,
        home_team_rank: home?.rank ?? null,
        away_team_id: away?.id,
        away_team_name: away?.team?.displayName,
        away_team_rank: away?.rank ?? null,
        conference: comp?.conference?.name ?? null,
        venue: e.venue?.fullName ?? null,
        status: e.status?.type?.name ?? "scheduled",
      };
    });

    const { error } = await supabase.from("ncaaf_games").upsert(rows, {
      onConflict: "espn_game_id",
    });

    if (error) return NextResponse.json({ success: false, error });

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}
