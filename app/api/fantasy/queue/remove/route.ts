import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
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

  // 2️⃣ Parse request body
  const { playerId } = await req.json();

  // 3️⃣ Use your server Supabase client (no user auth required)
  const supabase = await createSupabaseServerClient();

  // 4️⃣ Delete queue item for this user
  const { error } = await supabase
    .from("fantasy_queue")
    .delete()
    .eq("user_id", session.userId)
    .eq("player_id", playerId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
