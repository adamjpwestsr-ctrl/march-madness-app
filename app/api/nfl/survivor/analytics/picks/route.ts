import { NextResponse } from "next/server";
import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client failed" }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("survivor_pick_distribution");

  if (error) {
    console.error("Survivor pick distribution error:", error);
    return NextResponse.json({ error: "Failed to load pick distribution" }, { status: 500 });
  }

  return NextResponse.json({ rows: data || [] });
}
