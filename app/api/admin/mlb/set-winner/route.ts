import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { series_id, winner_team_id } = await req.json();

  const { error } = await supabase
    .from("mlb_schedule")
    .update({
      winner_team_id,
      is_draw: winner_team_id === null,
    })
    .eq("series_id", series_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

