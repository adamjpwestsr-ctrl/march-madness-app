import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { event_id, winner_player_id, winning_hr_total } = body;

  if (!event_id || !winner_player_id || !winning_hr_total) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: event_id, winner_player_id, winning_hr_total",
      },
      { status: 400 }
    );
  }

  // Update event with results
  const { data, error } = await supabase
    .from("mlb_derby_events")
    .update({
      winner_player_id: Number(winner_player_id),
      winning_hr_total: Number(winning_hr_total),
      status: "results_posted",
    })
    .eq("id", Number(event_id))
    .select()
    .single();

  if (error) {
    console.error("POST /mlb/derby/results error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 200 });
}
