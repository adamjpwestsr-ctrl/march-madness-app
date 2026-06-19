import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch latest logs (limit 50 for performance)
  const { data, error } = await supabase
    .from("import_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Import logs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data || [] });
}

