import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { week, teamId, userId } = await req.json();

    if (!week || !teamId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await supabase
      .from("nfl_challenge_selections")
      .upsert(
        {
          user_id: userId,
          week_number: week,
          selected_team_id: teamId,
        },
        { onConflict: "user_id,week_number" }
      );

    if (error) {
      console.error("Admin override error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin override fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

