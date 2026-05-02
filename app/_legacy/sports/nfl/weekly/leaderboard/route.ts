import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  // ⭐ MUST await the Supabase client
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("weekly_leaderboard");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
