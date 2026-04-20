export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // -----------------------------
  // 1. Read mm_session cookie
  // -----------------------------
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  let userId: number | null = null;

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      userId = parsed.userId ?? null;
    } catch {
      userId = null;
    }
  }

  // -----------------------------
  // 2. Always load tournaments + players
  // -----------------------------
  const { data: tournaments } = await supabase
    .from("golf_tournaments")
    .select("*")
    .order("start_date");

  const { data: players } = await supabase
    .from("golf_players")
    .select("*")
    .order("name");

  // -----------------------------
  // 3. Load picks ONLY if logged in
  // -----------------------------
  let picks: { tournament_id: number; player_id: number }[] = [];

  if (userId) {
    const { data: userPicks } = await supabase
      .from("golf_weekly_picks")
      .select("tournament_id, player_id")
      .eq("user_id", userId);

    picks = userPicks || [];
  }

  // -----------------------------
  // 4. Return unified state
  // -----------------------------
  return NextResponse.json({
    picks,
    tournaments: tournaments || [],
    players: players || [],
  });
}
