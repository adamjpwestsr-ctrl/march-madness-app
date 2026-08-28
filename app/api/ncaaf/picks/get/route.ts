import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);

  const email = searchParams.get("email");
  const seasonYear = parseInt(searchParams.get("seasonYear") || "0");
  const week = parseInt(searchParams.get("week") || "0");
  const mode = searchParams.get("mode");
  const groupCode = searchParams.get("groupCode");

  if (!email || !seasonYear || !week) {
    return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
  }

  // Find user
  const { data: user } = await supabase
    .from("ncaaf_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ picks: [] });
  }

  let query = supabase
    .from("ncaaf_picks")
    .select("game_id, picked_team_id")
    .eq("season_year", seasonYear)
    .eq("week", week)
    .eq("user_id", user.id);

  if (mode === "GROUP" && groupCode) {
    const { data: group } = await supabase
      .from("ncaaf_groups")
      .select("id")
      .eq("passcode", groupCode)
      .maybeSingle();

    if (group) query = query.eq("group_id", group.id);
  } else {
    query = query.is("group_id", null);
  }

  const { data: picks } = await query;

  return NextResponse.json({ picks });
}
