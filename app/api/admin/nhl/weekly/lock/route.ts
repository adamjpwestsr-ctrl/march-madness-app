import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // Use service role key instead of anon key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ change here
  );

  try {
    const { week, lock_time } = await req.json();

    if (!week || !lock_time) {
      return NextResponse.json(
        { error: "Missing week or lock_time" },
        { status: 400 }
      );
    }

    const parsedLockTime = new Date(lock_time);
    if (isNaN(parsedLockTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid lock_time format" },
        { status: 400 }
      );
    }

    const season_year = new Date().getFullYear();
    const isoLock = parsedLockTime.toISOString();

    const { error } = await supabase
      .from("sport_lock_times")
      .upsert(
        {
          sport: "NHL",
          week_number: week,
          season_year,
          lock_time: isoLock,
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



