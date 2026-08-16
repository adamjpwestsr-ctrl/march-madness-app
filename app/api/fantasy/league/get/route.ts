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

  // 2️⃣ Create Supabase client (no auth dependency)
  const supabase = await createSupabaseServerClient();

  // 3️⃣ Query league data
  const { data, error } = await supabase
    .from("fantasy_leagues")
    .select("*")
    .eq("id", leagueId)
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "League not found" }, { status: 404 });
  }

  // 4️⃣ Return league data
  return NextResponse.json(data);
}
