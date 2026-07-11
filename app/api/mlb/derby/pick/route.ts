import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { searchParams } = new URL(req.url);
  const eventIdParam = searchParams.get("event_id");

  if (!eventIdParam) {
    return NextResponse.json(
      { error: "Missing event_id" },
      { status: 400 }
    );
  }

  const eventId = Number(eventIdParam);
  if (Number.isNaN(eventId)) {
    return NextResponse.json(
      { error: "Invalid event_id" },
      { status: 400 }
    );
  }

  // Get current auth user (Supabase Auth)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // 🔑 Critical: filter by BOTH user_id (UUID) and event_id
  const { data, error } = await supabase
    .from("mlb_derby_picks")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    console.error("GET /mlb/derby/pick error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ pick: data ?? null }, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { event_id, player_id, predicted_hr_total } = body;

  if (!event_id || !player_id || predicted_hr_total == null) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: event_id, player_id, predicted_hr_total",
      },
      { status: 400 }
    );
  }

  const eventId = Number(event_id);
  const playerId = Number(player_id);
  const predictedTotal = Number(predicted_hr_total);

  if (
    Number.isNaN(eventId) ||
    Number.isNaN(playerId) ||
    Number.isNaN(predictedTotal)
  ) {
    return NextResponse.json(
      { error: "Invalid numeric values" },
      { status: 400 }
    );
  }

  // Get current auth user (Supabase Auth)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // 🔑 First, check if this user already has a pick for this event
  const { data: existingPick, error: existingError } = await supabase
    .from("mlb_derby_picks")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existingError) {
    console.error("POST /mlb/derby/pick existing error:", existingError);
    return NextResponse.json(
      { error: existingError.message },
      { status: 500 }
    );
  }

  let result;

  if (existingPick) {
    // ✅ Update ONLY this user's pick for this event
    const { data, error } = await supabase
      .from("mlb_derby_picks")
      .update({
        player_id: playerId,
        predicted_hr_total: predictedTotal,
      })
      .eq("id", existingPick.id)
      .select()
      .single();

    if (error) {
      console.error("POST /mlb/derby/pick update error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    result = data;
  } else {
    // ✅ Insert a NEW pick for this user + event
    const { data, error } = await supabase
      .from("mlb_derby_picks")
      .insert({
        user_id: user.id, // Supabase Auth UUID
        event_id: eventId,
        player_id: playerId,
        predicted_hr_total: predictedTotal,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /mlb/derby/pick insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    result = data;
  }

  return NextResponse.json(
    { pick: result, success: true },
    { status: 200 }
  );
}
