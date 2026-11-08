import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: convert source → team_id
async function resolveTeam(source: any) {
  if (!source || !source.type) return null;

  if (source.type === "team") {
    return source.value; // already a team_id
  }

  if (source.type === "seed") {
    const { data } = await supabase
      .from("tournament_teams")
      .select("id")
      .eq("seed", source.value)
      .single();

    return data?.id ?? null;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const {
      round64,
      round32,
      sweet16,
      elite8,
      final4,
      championship,
    } = await req.json();

    const allRounds = [
      { round: 1, games: round64 },
      { round: 2, games: round32 },
      { round: 3, games: sweet16 },
      { round: 4, games: elite8 },
      { round: 5, games: final4 },
      { round: 6, games: [championship] },
    ];

    const payload: any[] = [];

    for (const { round, games } of allRounds) {
      for (const g of games) {
        const team1_id = await resolveTeam(g.team1_source);
        const team2_id = await resolveTeam(g.team2_source);

        payload.push({
          round,
          game_number: g.game_number,
          region: g.region,
          team1_id,
          team2_id,
          home_score: 0,
          away_score: 0,
          winner: null,
          status: "pre",
          is_placeholder: false,
          completed: false,
          winner_to_game_id: null,
          bracket_id: null,
        });
      }
    }

    const { error } = await supabase
      .from("tournament_games")
      .upsert(payload, {
        onConflict: "round,game_number",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
