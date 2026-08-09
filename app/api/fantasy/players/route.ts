import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("nfl_players")
    .select("*")
    .order("name", { ascending: true });

  return NextResponse.json(data || []);
}
