import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { week_number } = await req.json();

  // Get all series for the week
  const { data: series, error: sErr } = await supabase
    .from("mlb_schedule")
    .select("series_id, winner_team_id, is_draw")
    .eq("week_number", week_number);

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  // Score each pick
  for (const s of series) {
    const { data: picks } = await supabase
  .from("mlb_challenge_selections")
  .select("id, selected_team_id")
  .eq("series_id", s.series_id)
  .eq("week_number", week_number);

if (!picks || picks.length === 0) continue; // ✅ skip if no picks

for (const p of picks) {
  const correct =
    s.is_draw ? false : p.selected_team_id === s.winner_team_id;

  await supabase
    .from("mlb_challenge_selections")
    .update({
      points_awarded: correct ? 1 : 0,
    })
    .eq("id", p.id);
}
  return NextResponse.json({ success: true });
}
