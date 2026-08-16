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
  const { leagueId, userId, season } = body;

  // 3️⃣ Use your server Supabase client (no user auth required)
  const supabase = await createSupabaseServerClient();

  // 4️⃣ Create roster
  const { data: roster, error: rosterErr } = await supabase
    .from("fantasy_roster")
    .insert({
      user_id: userId,
      season,
    })
    .select()
    .single();

  if (rosterErr) {
    console.error(rosterErr);
    return NextResponse.json(
      { error: "Failed to create roster" },
      { status: 500 }
    );
  }

  // 5️⃣ Load all picks for this league
  const { data: picks, error: picksErr } = await supabase
    .from("fantasy_picks")
    .select("player_id")
    .eq("league_id", leagueId);

  if (picksErr) {
    console.error(picksErr);
    return NextResponse.json(
      { error: "Failed to load picks" },
      { status: 500 }
    );
  }

  // 6️⃣ Build roster player rows
  const rows = picks.map((p) => ({
    roster_id: roster.id,
    player_id: p.player_id,
  }));

  // 7️⃣ Insert roster players
  const { error: insertErr } = await supabase
    .from("fantasy_roster_players")
    .insert(rows);

  if (insertErr) {
    console.error(insertErr);
    return NextResponse.json(
      { error: "Failed to add players to roster" },
      { status: 500 }
    );
  }

  // 8️⃣ Success
  return NextResponse.json({ rosterId: roster.id });
}
