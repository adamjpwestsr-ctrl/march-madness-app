import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { week_number, picks } = body;

  if (!week_number || !Array.isArray(picks))
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const inserts = picks.map((p) => ({
    user_id: "00000000-0000-0000-0000-000000000000", // replace with auth.uid() later
    week_number,
    series_id: p.series_id,
    selected_team_id: p.selected_team_id,
  }));

  const { error } = await supabase.from("mlb_challenge_selections").insert(inserts);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}



