import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient.ts";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data: games, error } = await supabase
    .from("games")
    .select("*")
    .order("game_id");

  if (error) {
    return NextResponse.json(
      { error: "Failed to load games." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    games: games ?? [],
  });
}
