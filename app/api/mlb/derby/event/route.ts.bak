import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

// GET: fetch current Derby event
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("mlb_derby_events")
    .select("*")
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET /mlb/derby/event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data || null });
}

// POST: create a new Derby event
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { event_year, event_date, status } = body;

  if (!event_year || !event_date || !status) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("mlb_derby_events")
    .insert([
      {
        event_year,
        event_date,
        status,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("POST /mlb/derby/event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}

// PATCH: update Derby event (status or results)
export async function PATCH(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { event_id, updates } = body;

  if (!event_id || !updates) {
    return NextResponse.json(
      { error: "Missing event_id or updates." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("mlb_derby_events")
    .update(updates)
    .eq("id", event_id)
    .select()
    .single();

  if (error) {
    console.error("PATCH /mlb/derby/event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 200 });
}
