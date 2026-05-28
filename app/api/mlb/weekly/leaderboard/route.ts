import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Run optimized join query directly
    const { data, error } = await supabase.rpc("get_mlb_leaderboard_with_usernames");

    if (error) throw error;

    return NextResponse.json({ leaderboard: data });
  } catch (err: any) {
    console.error("Leaderboard fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
