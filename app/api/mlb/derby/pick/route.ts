import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

// GET: fetch current user's pick for the active event
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  // Optionally, you can pass event_id as a query param
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");

  const query = supabase
    .from("mlb_derby_picks")
    .select("*")
    .eq("user_id", user.id);

  if (eventId) query.eq("event_id", Number(eventId));

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("GET /mlb/derby/pick error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pick: data || null });
}

// POST: create or update user's pick
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { event_id, player_id, predicted_hr_total } = body;

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  if (!event_id || !player_id || !predicted_hr_total) {
    return NextResponse.json(
      { error: "Missing required fields: event_id, player_id, predicted_hr_total" },
      { status: 400 }
    );
  }

  // Upsert (replace existing pick for this user/event)
  const { data, error } = await supabase
    .from("mlb_derby_picks")
    .upsert(
      {
        user_id: user.id,
        event_id: Number(event_id),
        player_id: Number(player_id),
        predicted_hr_total: Number(predicted_hr_total),
      },
      { onConflict: ["user_id", "event_id"] }
    )
    .select()
    .single();

  if (error) {
    console.error("POST /mlb/derby/pick error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pick: data }, { status: 201 });
}
