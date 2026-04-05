export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: Request) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const url = new URL(req.url);
  const bracketId = url.searchParams.get("bracketId");

  const { data: rawGames, error: gameError } = await supabase
    .from("games")
    .select("*")
    .order("round", { ascending: true })
    .order("game_id", { ascending: true });

  if (gameError) {
    console.error("Game load error:", gameError);
    return NextResponse.json({ error: "Failed to load games" }, { status: 500 });
  }

  const games = (rawGames || []).map((g) => ({
    game_id: g.game_id,
    round: g.round,
    region: g.region,
    team1: g.team1
      ? { team_id: g.team1, name: g.team1, seed: g.seed1 ?? null }
      : null,
    team2: g.team2
      ? { team_id: g.team2, name: g.team2, seed: g.seed2 ?? null }
      : null,
    winner_team_id: g.winner ?? null,
    source_game1: g.source_game1,
    source_game2: g.source_game2,
  }));

  let picks: any[] = [];
  if (bracketId) {
    const { data: pickData } = await supabase
      .from("picks")
      .select("*")
      .eq("bracket_id", bracketId);

    picks = pickData || [];
  }

  return NextResponse.json({
    games,
    picks,
    bracket: { bracket_id: bracketId },
  });
}
