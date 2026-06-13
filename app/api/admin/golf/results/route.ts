import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tournament_id, player_id, final_score_relative_to_par, is_winner } = body;

    if (!tournament_id || !player_id || final_score_relative_to_par === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("golf_weekly_results")
      .upsert(
        {
          tournament_id,
          player_id,
          final_score_relative_to_par,
          is_winner: !!is_winner,
        },
{ onConflict: "tournament_id,player_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
