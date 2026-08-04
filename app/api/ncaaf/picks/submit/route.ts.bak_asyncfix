import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { user_id, game_id, selected_team_id } = body;

  const { error } = await supabase.from("ncaaf_picks").upsert(
    {
      user_id,
      game_id,
      selected_team_id,
    },
    { onConflict: "user_id,game_id" }
  );

  if (error) return NextResponse.json({ success: false, error });

  return NextResponse.json({ success: true });
}
