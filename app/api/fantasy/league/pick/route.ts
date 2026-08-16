import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  // 1️⃣ Read mm_session cookie (async in your environment)
  const store = await cookies();
  const raw = store.get("mm_session")?.value;

  if (!raw) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // 2️⃣ Parse request body
  const body = await req.json();
  const { leagueId, teamId, pickNumber, playerId } = body;

  // 3️⃣ Use your server Supabase client (no user auth required)
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("fantasy_picks")
    .insert({
      league_id: leagueId,
      team_id: teamId,
      pick_number: pickNumber,
      player_id: playerId,
    });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save pick" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
