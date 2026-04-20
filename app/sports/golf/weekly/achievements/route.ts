export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

const ALL_ACHIEVEMENTS = [
  { id: "season_veteran", name: "Season Veteran", description: "Complete 25 events", target: 25 },
  { id: "clutch_player", name: "Clutch Player", description: "Score points in 5 events", target: 5 },
  { id: "wildcard_wizard", name: "Wildcard Wizard", description: "Hit 3 sleeper picks", target: 3 },
  { id: "champion_whisperer", name: "Champion Whisperer", description: "Pick 2 winners", target: 2 },
];

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getUserId();

    const { data } = await supabase
      .from("golf_weekly_achievements")
      .select("*")
      .eq("user_id", userId);

    const achievements = ALL_ACHIEVEMENTS.map((a) => {
      const row = data?.find((r) => r.achievement_id === a.id);
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        target: a.target,
        progress: row?.progress ?? 0,
        completed: row?.completed ?? false,
      };
    });

    return NextResponse.json({ achievements });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getUserId();
    const body = await req.json();
    const { achievement_id, progress, target, completed } = body;

    if (!achievement_id) throw new Error("achievement_id required");

    const { data, error } = await supabase
      .from("golf_weekly_achievements")
      .upsert(
        {
          user_id: userId,
          achievement_id,
          progress,
          target,
          completed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,achievement_id" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ achievement: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
