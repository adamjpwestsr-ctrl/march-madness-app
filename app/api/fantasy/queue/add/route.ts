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

  // 4️⃣ Get current max rank for this user
  const { data: existing } = await supabase
    .from("fantasy_queue")
    .select("rank")
    .eq("user_id", session.userId)
    .order("rank", { ascending: false })
    .limit(1);

  const nextRank = existing?.[0]?.rank ? existing[0].rank + 1 : 1;

  // 5️⃣ Insert queue item
  const { error } = await supabase
    .from("fantasy_queue")
    .insert({
      user_id: session.userId,
      player_id: playerId,
      rank: nextRank,
    });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
