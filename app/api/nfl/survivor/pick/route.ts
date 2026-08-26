import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { week, teamId } = await req.json();

    // Read mm_session cookie
    const cookie = req.headers.get("cookie") || "";
    const sessionRaw = cookie
      .split("; ")
      .find((row) => row.startsWith("mm_session="))
      ?.split("=")[1];

    if (!sessionRaw) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(decodeURIComponent(sessionRaw));
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    if (!week || !teamId || !user?.userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Survivor mode: one pick per week, game_id = -1
    const { error } = await supabase.from("user_picks").upsert(
      {
        user_id: user.userId,
        sport: "NFL",
        week_number: week,
        game_id: -1, // Survivor-specific
        winner_team_id: teamId,
      },
      { onConflict: "user_id,game_id" } // matches your table's unique constraint
    );

    if (error) {
      console.error("Survivor pick error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Survivor pick fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
