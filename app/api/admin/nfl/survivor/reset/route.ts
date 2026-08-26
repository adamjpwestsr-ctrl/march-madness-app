import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client failed" }, { status: 500 });
  }

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

  const { week } = await req.json();

  if (!week) {
    return NextResponse.json({ error: "Missing week" }, { status: 400 });
  }

  // Delete Survivor picks for this week (game_id = -1)
  const { error: picksError } = await supabase
    .from("user_picks")
    .delete()
    .eq("sport", "NFL")
    .eq("week_number", week)
    .eq("game_id", -1);

  if (picksError) {
    console.error("Survivor reset picks error:", picksError);
    return NextResponse.json({ error: "Failed to reset picks" }, { status: 500 });
  }

  // Reset Survivor stats for users eliminated in this week via RPC
  const { error: resetError } = await supabase.rpc("reset_survivor_week", {
    p_week: week,
  });

  if (resetError) {
    console.error("Survivor reset RPC error:", resetError);
    return NextResponse.json({ error: "Failed to reset survivor stats" }, { status: 500 });
  }

  await supabase.from("survivor_admin_audit").insert({
    action: "reset_week",
    week_number: week,
    admin_email: session.email,
  });

  return NextResponse.json({ ok: true });
}
