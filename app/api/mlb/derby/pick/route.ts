import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

// GET — fetch the current user's pick for a specific event
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

  // Require event_id
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");

  if (!eventId) {
    return NextResponse.json(
      { error: "Missing event_id" },
      { status: 400 }
    );
  }

  // Fetch pick for THIS user + THIS event
  const { data, error } = await supabase
    .from("mlb_derby_picks")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_id", Number(eventId))
    .maybeSingle();

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
        // Supabase requires comma-separated string for multi-column conflict
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
