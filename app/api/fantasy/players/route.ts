// app/api/fantasy/players/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("nfl_players")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Player fetch error:", error);
    return NextResponse.json({ status: "error", message: error.message });
  }

  return NextResponse.json({ status: "ok", players: data });
}
