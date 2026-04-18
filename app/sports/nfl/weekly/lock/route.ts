import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { lock_time } = body;

  const { error } = await supabase
    .from("nfl_weekly_settings")
    .update({ lock_time })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
