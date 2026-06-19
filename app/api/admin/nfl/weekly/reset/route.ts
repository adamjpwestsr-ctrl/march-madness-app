import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { week } = await req.json();

    if (!week) {
      return NextResponse.json({ error: "Missing week number" }, { status: 400 });
    }

    // Delete all picks for that week
    const { error: picksError } = await supabase
      .from("nfl_challenge_selections")
      .delete()
      .eq("week_number", week);

    if (picksError) {
      console.error("Reset picks error:", picksError);
      return NextResponse.json({ error: picksError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reset route fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

