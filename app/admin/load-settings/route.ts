import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tournament_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to load tournament settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    lock_time: data?.lock_time ?? null,
    is_published: data?.is_published ?? false,
    published_at: data?.published_at ?? null,
  });
}
