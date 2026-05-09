import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies(); // ← CORRECT

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

  const { data: tournament } = await supabase
    .from("golf_tournaments")
    .select("*")
    .eq("is_current", true)
    .single();

  if (!tournament) {
    return Response.json({ error: "No active tournament" }, { status: 400 });
  }

  const { data: existingPick } = await supabase
    .from("golf_weekly_picks")
    .select("*")
    .eq("user_id", userId)
    .eq("tournament_id", tournament.id)
    .maybeSingle();

  if (existingPick) {
    const { error } = await supabase
      .from("golf_weekly_picks")
      .update({ player_id: golferId })
      .eq("id", existingPick.id);

    if (error) return Response.json({ error }, { status: 500 });
  } else {
    const { error } = await supabase.from("golf_weekly_picks").insert({
      user_id: userId,
      tournament_id: tournament.id,
      player_id: golferId,
    });

    if (error) return Response.json({ error }, { status: 500 });
  }

  return Response.json({ success: true });
}
