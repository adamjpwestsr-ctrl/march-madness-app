import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const {
    email,
    seasonYear,
    week,
    picks,        // array: [{ gameId, teamId }]
    mode,         // "GLOBAL" or "GROUP"
    groupCode,    // optional
  } = body;

  if (!email || !seasonYear || !week || !picks) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // 1. Ensure user exists
  let { data: user } = await supabase
    .from("ncaaf_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    const { data: newUser, error: userError } = await supabase
      .from("ncaaf_users")
      .insert({ email })
      .select()
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to create user." },
        { status: 500 }
      );
    }

    user = newUser;
  }

  // 2. Handle group membership if mode === GROUP
  let groupId: number | null = null;
  let groupName: string | null = null;

  if (mode === "GROUP") {
    if (!groupCode) {
      return NextResponse.json(
        { error: "Group code required for private group." },
        { status: 400 }
      );
    }

    const { data: group } = await supabase
      .from("ncaaf_groups")
      .select("*")
      .eq("passcode", groupCode)
      .maybeSingle();

    if (!group) {
      return NextResponse.json(
        { error: "Invalid group code." },
        { status: 404 }
      );
    }

    groupId = group.id;
    groupName = group.name;

    // Ensure membership exists
    const { error: memberError } = await supabase
      .from("ncaaf_group_members")
      .upsert({
        group_id: group.id,
        user_id: user.id,
      });

    if (memberError) {
      return NextResponse.json(
        { error: "Failed to join group." },
        { status: 500 }
      );
    }
  }

  // 3. Handle global leaderboard opt-in
  if (mode === "GLOBAL") {
    await supabase
      .from("ncaaf_global_entries")
      .upsert({ user_id: user.id });
  }

  // 4. Insert picks
  const payload = picks.map((p: any) => ({
    season_year: seasonYear,
    week,
    game_id: p.gameId,
    user_id: user.id,
    group_id: groupId,
    picked_team_id: p.teamId,
  }));

  const { error: pickError } = await supabase
    .from("ncaaf_picks")
    .upsert(payload, {
      onConflict: "week,game_id,user_id,group_id",
    });

  if (pickError) {
    return NextResponse.json(
      { error: "Failed to save picks." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    saved: payload.length,
    mode,
    modeLabel: mode === "GLOBAL"
      ? "Global Leaderboard"
      : `Private Group — ${groupName}`,
    groupId,
    groupName,
  });
}
