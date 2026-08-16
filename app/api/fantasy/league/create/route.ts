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
  const {
    leagueName,
    season,
    numTeams,
    draftType,
    pickTimer,
    draftOrder,
  } = body;

  // 3️⃣ Use your server Supabase client (no user auth required)
  const supabase = await createSupabaseServerClient();

  // 4️⃣ Create league
  const { data: league, error } = await supabase
    .from("fantasy_leagues")
    .insert({
      league_name: leagueName,
      season,
      num_teams: numTeams,
      draft_type: draftType,
      pick_timer: pickTimer,
      draft_order: draftOrder,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create league" },
      { status: 500 }
    );
  }

  // 5️⃣ Create teams
  const teamRows = draftOrder.map((teamId: number, idx: number) => ({
    league_id: league.id,
    team_name: `Team ${teamId}`,
    draft_position: idx + 1,
  }));

  const { error: teamErr } = await supabase
    .from("fantasy_teams")
    .insert(teamRows);

  if (teamErr) {
    console.error(teamErr);
    return NextResponse.json(
      { error: "Failed to create teams" },
      { status: 500 }
    );
  }

  // 6️⃣ Success
  return NextResponse.json({ leagueId: league.id });
}
