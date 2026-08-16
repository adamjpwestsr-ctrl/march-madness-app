import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
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

  // 2️⃣ Use your server Supabase client (no user auth required)
  const supabase = await createSupabaseServerClient();

  // 3️⃣ Query the user's queue using your mm_session userId
  const { data, error } = await supabase
    .from("fantasy_queue")
    .select("player_id, rank")
    .eq("user_id", session.userId)
    .order("rank", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ queue: data });
}
