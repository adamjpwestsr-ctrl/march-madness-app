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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;
  const body = await req.json();
  const raceId = body.raceId;
  const driverId = body.driverId;

  if (!raceId || !driverId) {
    return Response.json(
      { error: "Missing raceId or driverId" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("nascar_picks")
    .upsert(
      {
        user_id: userId,
        race_id: raceId,
        driver_id: driverId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,race_id" }
    );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
