import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");

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

  // 2️⃣ Use your server Supabase client (no user auth required)
  const supabase = await createSupabaseServerClient();

  // 3️⃣ Query fantasy teams
  const { data, error } = await supabase
    .from("fantasy_teams")
    .select("*")
    .eq("league_id", leagueId)
    .order("draft_position", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load teams" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
