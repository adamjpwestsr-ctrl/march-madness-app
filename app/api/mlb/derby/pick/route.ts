import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

// GET — fetch the current user's pick for the event
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  // Optional event_id query param
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");

  let query = supabase
    .from("mlb_derby_picks")
    .select("*")
    .eq("user_id", user.id);

  if (eventId) {
    query = query.eq("event_id", Number(eventId));
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("GET /mlb/derby/pick error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pick: data || null });
}

// POST — save or update user's pick
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
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  if (!event_id || !player_id || !predicted_hr_total) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: event_id, player_id, predicted_hr_total",
      },
      { status: 400 }
    );
  }

  // Upsert using your unique constraint (user_id, event_id)
  const { data, error } = await supabase
    .from("mlb_derby_picks")
    .upsert(
      {
        user_id: user.id,
        event_id: Number(event_id),
        player_id: Number(player_id),
        predicted_hr_total: Number(predicted_hr_total),
      },
      {
        // IMPORTANT: Supabase requires a comma-separated string, not an array
        onConflict: "user_id,event_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("POST /mlb/derby/pick error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pick: data }, { status: 201 });
}
