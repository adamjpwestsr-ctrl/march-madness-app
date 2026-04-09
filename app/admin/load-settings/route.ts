// app/api/admin/load-settings/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabaseServerClient";

export async function GET() {
  const supabase = createClient();

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
