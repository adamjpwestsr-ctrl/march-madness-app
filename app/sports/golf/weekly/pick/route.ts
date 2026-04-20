export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  // -----------------------------
  // 1. Parse mm_session cookie
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

  if (!userId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // -----------------------------
  // 2. Parse request body
  // -----------------------------
  const { tournament_id, player_id } = await req.json();

  if (!tournament_id || !player_id) {
    return NextResponse.json(
      { error: "Missing tournament_id or player_id" },
      { status: 400 }
    );
  }

  // -----------------------------
  // 3. Insert or update pick
  // -----------------------------
  const { error } = await supabase
    .from("golf_weekly_picks")
    .upsert({
      user_id: userId,
      tournament_id,
      player_id,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
