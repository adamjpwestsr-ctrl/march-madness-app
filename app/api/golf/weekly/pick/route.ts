import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;
  const body = await req.json();
  const golferId = body.golferId;

  if (!golferId) {
    return Response.json({ error: "Missing golferId" }, { status: 400 });
  }

  // Get current tournament
  const { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .single();

  if (!tournament) {
    return Response.json({ error: "No active tournament" }, { status: 400 });
  }

  // Check if user already made a pick
  const { data: existingPick } = await supabase
    .from("golf_weekly_picks")
    .select("*")
    .eq("user_id", userId)
    .eq("tournament_id", tournament.id)
    .maybeSingle();

  if (existingPick) {
    // Update existing pick
    const { error } = await supabase
      .from("golf_weekly_picks")
      .update({ player_id: golferId })
      .eq("id", existingPick.id);

    if (error) return Response.json({ error }, { status: 500 });
  } else {
    // Insert new pick
    const { error } = await supabase.from("golf_weekly_picks").insert({
      user_id: userId,
      tournament_id: tournament.id,
      player_id: golferId,
    });

    if (error) return Response.json({ error }, { status: 500 });
  }

  return Response.json({ success: true });
}
