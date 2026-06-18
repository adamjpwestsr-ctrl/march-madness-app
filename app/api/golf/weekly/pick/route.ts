import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies(); // ❗ NO await

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

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

  const { data: tournament, error: tErr } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  if (tErr || !tournament) {
    return Response.json({ error: "No active tournament" }, { status: 400 });
  }

  const tournamentId = tournament.id;

  const { error: upsertErr } = await supabase
    .from("golf_weekly_picks")
    .upsert(
      {
        auth_id: authId,
        tournament_id: tournamentId,
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
