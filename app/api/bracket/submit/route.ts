import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ⭐ Set your lock date here
const LOCK_DATE = new Date("2026-03-20T12:00:00Z"); // Example — adjust as needed

export async function POST(req: Request) {
  const { bracketId, tiebreaker } = await req.json();

  if (!bracketId || tiebreaker === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check lock
  const now = new Date();
  if (now > LOCK_DATE) {
    return NextResponse.json(
      { error: "Bracket submissions are locked" },
      { status: 403 }
    );
  }

  // Read session cookie
  const cookieStore = await cookies();
  const session = cookieStore.get("mm_session");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId } = JSON.parse(session.value);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Validate bracket ownership
  const { data: bracket } = await supabase
    .from("brackets")
    .select("user_id")
    .eq("bracket_id", bracketId)
    .single();

  if (!bracket || bracket.user_id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Validate champion pick exists
  const { data: champPick } = await supabase
    .from("picks")
    .select("*")
    .eq("bracket_id", bracketId)
    .eq("game_id", 63) // Championship game
    .single();

  if (!champPick) {
    return NextResponse.json(
      { error: "You must pick a champion before submitting" },
      { status: 400 }
    );
  }

  // Save tiebreaker
  await supabase
    .from("brackets")
    .update({ tiebreaker_score: tiebreaker })
    .eq("bracket_id", bracketId);

  return NextResponse.json({ success: true });
}
