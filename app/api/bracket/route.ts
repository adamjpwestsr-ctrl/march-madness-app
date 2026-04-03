import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bid = searchParams.get("bid");

  if (!bid) {
    return NextResponse.json({ error: "Missing bid" }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Load bracket only (safe version)
  const { data: bracket, error: bracketErr } = await supabase
    .from("brackets")
    .select("*")
    .eq("bracket_id", bid)
    .single();

  if (bracketErr || !bracket) {
    return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
  }

  return NextResponse.json({
    bracket,
    picks: [],
    games: [],
  });
}
