import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabaseServerClient";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .order("game_id");

  return NextResponse.json({ games: games ?? [] });
}
