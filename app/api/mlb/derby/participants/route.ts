import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

// GET: fetch participants for a given event
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");

  if (!eventId) {
    return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mlb_derby_players")
    .select("*")
    .eq("event_id", Number(eventId))
    .order("order_index", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ participants: data });
}

// POST: add a new participant
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  // Accept both schema-style and UI-style field names
  const {
    event_id,
    player_name,
    team_name,
    name,
    team,
    hr_count = 0,
    image_url = null,
    order_index = 0,
  } = body;

  const finalPlayerName = player_name ?? name;
  const finalTeamName = team_name ?? team;

  if (!event_id || !finalPlayerName || !finalTeamName) {
    return NextResponse.json(
      { error: "Missing required fields: event_id, player_name, team_name" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("mlb_derby_players")
    .insert([
      {
        event_id: Number(event_id),
        player_name: finalPlayerName,
        team_name: finalTeamName,
        hr_count: Number(hr_count),
        image_url,
        order_index: Number(order_index),
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ participant: data }, { status: 201 });
}

// DELETE: remove a participant
export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("mlb_derby_players")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
