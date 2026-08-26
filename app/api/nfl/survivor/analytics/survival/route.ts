import { NextResponse } from "next/server";
import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client failed" }, { status: 500 });
  }

  // Example: count alive users per week based on eliminated_week
  const { data, error } = await supabase.rpc("survivor_survival_curve");

  if (error) {
    console.error("Survivor survival curve error:", error);
    return NextResponse.json({ error: "Failed to load survival curve" }, { status: 500 });
  }

  return NextResponse.json({ rows: data || [] });
}
