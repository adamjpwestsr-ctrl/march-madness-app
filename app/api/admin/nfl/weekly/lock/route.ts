import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { week, lock_time } = await req.json();

    if (!week || !lock_time) {
      return NextResponse.json(
        { error: "Missing week or lock_time" },
        { status: 400 }
      );
    }

    // Normalize timestamp to full ISO format
    const parsedLockTime = new Date(lock_time);
    if (isNaN(parsedLockTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid lock_time format" },
        { status: 400 }
      );
    }

    const season_year = new Date().getFullYear();

    const { error } = await supabase
      .from("sport_lock_times")
      .upsert(
        {
          sport: "NFL",
          week_number: week,
          season_year,
          lock_time: parsedLockTime.toISOString(), // ensures valid timestamptz
        },
        { onConflict: "sport,season_year,week_number" }
      );

    if (error) {
      console.error("Lock update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Lock route fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
