import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = supabaseServerClient();

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

