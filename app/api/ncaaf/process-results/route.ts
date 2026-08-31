import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const seasonYear = Number(body.seasonYear);
  const week = Number(body.week);

  if (!seasonYear || !week) {
    return NextResponse.json(
      { error: "seasonYear and week required" },
      { status: 400 }
    );
  }

  // Load games for this week
  const { data: games, error: gamesError } = await supabase
    .from("ncaaf_games")
    .select("id, home_team_id, away_team_id, home_team_score, away_team_score")
    .eq("season_year", seasonYear)
    .eq("week", week);

  if (gamesError || !games) {
    return NextResponse.json(
      { error: gamesError?.message ?? "No games" },
      { status: 500 }
    );
  }

  // Build winner map
  const winners: Record<number, string> = {};
  games.forEach((g) => {
    if (g.home_team_score === null || g.away_team_score === null) return;
    winners[g.id] =
      g.home_team_score > g.away_team_score ? g.home_team_id : g.away_team_id;
  });

  // Load picks for this week
  const { data: picks, error: picksError } = await supabase
    .from("ncaaf_picks")
    .select("id, game_id, picked_team_id")
    .eq("season_year", seasonYear)
    .eq("week", week);

  if (picksError || !picks) {
    return NextResponse.json(
      { error: picksError?.message ?? "No picks" },
      { status: 500 }
    );
  }

  // Compute correctness + points
  const updates = picks.map((p) => {
    const winner = winners[p.game_id];
    const isCorrect = !!winner && winner === p.picked_team_id;
    const points = isCorrect ? 1 : 0; // simple scoring; can extend later

    return {
      id: p.id,
      is_correct: isCorrect,
      points,
    };
  });

  // Update picks
  const { error: updateError } = await supabase
    .from("ncaaf_picks")
    .upsert(updates, { onConflict: "id" });

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    processed: updates.length,
  });
}
