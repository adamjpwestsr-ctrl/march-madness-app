import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabaseServerClient";


export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("tournament_settings")
    .select("*")
    .limit(1)
    .single();

  return NextResponse.json({
    lock_time: data?.lock_time ?? null,
    is_published: data?.is_published ?? false,
    published_at: data?.published_at ?? null,
  });
}
