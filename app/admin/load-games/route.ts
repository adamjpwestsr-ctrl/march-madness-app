// app/api/admin/load-games/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabaseServerClient";

export async function GET() {
  const supabase = createClient();

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .order("game_id");

  return NextResponse.json({ games: games ?? [] });
}
