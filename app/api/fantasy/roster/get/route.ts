import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);

  const userId = Number(searchParams.get("userId"));
  const season = Number(searchParams.get("season"));

  const { data } = await supabase
    .from("fantasy_rosters")
    .select("*")
    .eq("user_id", userId)
    .eq("season", season)
    .maybeSingle();

  return NextResponse.json(data || {});
}
