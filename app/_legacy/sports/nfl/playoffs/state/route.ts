import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Load the saved playoff bracket
  const { data, error } = await supabase
    .from("playoff_brackets")
    .select("bracket")
    .eq("season", 2024) // or dynamic if needed
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found (not a real error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    bracket: data?.bracket || null,
  });
}
