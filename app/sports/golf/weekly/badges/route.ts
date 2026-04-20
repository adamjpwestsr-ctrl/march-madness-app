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

const ALL_BADGES = [
  { id: "on_a_roll", emoji: "🔥", name: "On a Roll", description: "3‑week streak" },
  { id: "hot_hand", emoji: "💥", name: "Hot Hand", description: "5‑week streak" },
  { id: "ironman", emoji: "💎", name: "Ironman", description: "10‑week streak" },
  { id: "perfect_season", emoji: "🌟", name: "Perfect Season", description: "Picked every event" },
  { id: "ice_in_veins", emoji: "🧊", name: "Ice in the Veins", description: "Picked a winner" },
  { id: "sleeper_sniper", emoji: "🎯", name: "Sleeper Sniper", description: "Picked a sleeper" },
  { id: "major_master", emoji: "🏆", name: "Major Master", description: "Picked all majors" },
  { id: "opening_drive", emoji: "🚀", name: "Opening Drive", description: "First pick" },
  { id: "season_explorer", emoji: "🧭", name: "Season Explorer", description: "10 events completed" },
  { id: "top_ten_percent", emoji: "🥇", name: "Top 10%", description: "Top 10% on leaderboard" },
];

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getUserId();

    const { data } = await supabase
      .from("golf_weekly_badges")
      .select("badge_id, earned_at")
      .eq("user_id", userId);

    const earned = new Set((data || []).map((b) => b.badge_id));

    const badges = ALL_BADGES.map((b) => ({
      ...b,
      earned: earned.has(b.id),
      earned_at: data?.find((x) => x.badge_id === b.id)?.earned_at ?? null,
    }));

    return NextResponse.json({ badges });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getUserId();
    const body = await req.json();
    const { badge_id } = body;

    if (!badge_id) throw new Error("badge_id required");

    const { error } = await supabase
      .from("golf_weekly_badges")
      .upsert(
        {
          user_id: userId,
          badge_id,
          earned_at: new Date().toISOString(),
        },
        { onConflict: "user_id,badge_id" }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
