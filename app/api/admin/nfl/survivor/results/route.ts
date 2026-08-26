import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client failed" }, { status: 500 });
  }

  // Read admin session
  const store = await cookies();
  const raw = store.get("mm_session")?.value;

  if (!raw) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse body
  const { week, winningTeamId } = await req.json();

  if (!week || !winningTeamId) {
    return NextResponse.json(
      { error: "Missing week or winningTeamId" },
      { status: 400 }
    );
  }

  // Load all Survivor picks for this week
  const { data: picks, error: picksError } = await supabase
    .from("user_picks")
    .select("user_id, winner_team_id")
    .eq("sport", "NFL")
    .eq("week_number", week)
    .eq("game_id", -1); // Survivor picks use game_id = -1

  if (picksError) {
    console.error("Survivor picks load error:", picksError);
    return NextResponse.json({ error: "Failed to load picks" }, { status: 500 });
  }

  // Process each pick: correct or eliminated
  for (const pick of picks || []) {
    const correct = pick.winner_team_id === winningTeamId;

    const { error: statsError } = await supabase.rpc("update_survivor_stats", {
      p_user_id: pick.user_id,
      p_week: week,
      p_correct: correct,
    });

    if (statsError) {
      console.error("Survivor stats update error:", statsError);
      return NextResponse.json(
        { error: "Failed to update survivor stats" },
        { status: 500 }
      );
    }
  }

  // Audit log
  await supabase.from("survivor_admin_audit").insert({
    action: "submit_results",
    week_number: week,
    winning_team_id: winningTeamId,
    admin_email: session.email,
  });

  return NextResponse.json({ ok: true });
}
