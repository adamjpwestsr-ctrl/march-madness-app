import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { sport, season_year } = await req.json();

  if (!sport || !season_year) {
    return NextResponse.json(
      { error: "Missing sport or season_year" },
      { status: 400 }
    );
  }

  // Delete only schedule rows — preserve all history
  const { error } = await supabase
    .from("sport_schedule")
    .delete()
    .eq("sport", sport)
    .eq("season_year", season_year);

  if (error) {
    console.error("Clear season error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("import_logs").insert({
    sport,
    action: "clear",
    timestamp: new Date().toISOString(),
    row_count: 0,
    status: "success",
  });

  return NextResponse.json({ success: true });
}
