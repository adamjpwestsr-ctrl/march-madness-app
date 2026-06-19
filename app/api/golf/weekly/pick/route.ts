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

  const authId = user.id;
  const body = await req.json();
  const golferId = body.golferId;

  if (!golferId) {
    return Response.json({ error: "Missing golferId" }, { status: 400 });
  }

  const { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  if (!tournament) {
    return Response.json({ error: "No active tournament" }, { status: 400 });
  }

  const { error: upsertErr } = await supabase
    .from("golf_weekly_picks")
    .upsert(
      {
        auth_id: authId,
        tournament_id: tournament.id,
        player_id: golferId,
      },
      {
        onConflict: "auth_id,tournament_id",
      }
    );

  if (upsertErr) {
    return Response.json({ error: upsertErr.message }, { status: 500 });
  }

  return Response.json({ success: true });
}


