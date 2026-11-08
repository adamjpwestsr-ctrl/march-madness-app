import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const url = new URL(req.url);
  const threadId = url.searchParams.get("thread_id");

  const query = supabase
    .from("forum_posts")
    .select("id, display_name, message, created_at, thread_id")
    .order("created_at", { ascending: false });

  if (threadId) query.eq("thread_id", threadId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
