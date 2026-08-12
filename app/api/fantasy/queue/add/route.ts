import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { playerId } = await req.json();

  // Get current max rank
  const { data: existing } = await supabase
    .from("fantasy_queue")
    .select("rank")
    .eq("user_id", user.id)
    .order("rank", { ascending: false })
    .limit(1);

  const nextRank = existing?.[0]?.rank ? existing[0].rank + 1 : 1;

  const { error } = await supabase
    .from("fantasy_queue")
    .insert({
      user_id: user.id,
      player_id: playerId,
      rank: nextRank,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
