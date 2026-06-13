import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Get authenticated user
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
  const { data: tournament, error: tErr } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  if (tErr || !tournament) {
    return Response.json({ error: "No active tournament" }, { status: 400 });
  }

  const tournamentId = tournament.id;

  // UPSERT pick (correct conflict target)
  const { error } = await supabase
    .from("golf_weekly_picks")
    .upsert(
      {
        user_id: userId,
        tournament_id: tournamentId,
        player_id: golferId,
      },
      {
        onConflict: "user_id,tournament_id", // ⭐ Correct conflict target
      }
    );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
