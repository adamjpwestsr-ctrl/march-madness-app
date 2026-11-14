
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("forum_posts")
    .select("id, display_name, message, created_at, thread_id, email")
    .or("deleted.is.null,deleted.eq.false")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Forum GET error:", error.message);
    return NextResponse.json(
      { error: "Unable to load forum messages." },
      { status: 500 }
    );
  }

  // Retrieve the newest 100 messages, then display them chronologically.
  return NextResponse.json((data || []).reverse());
}
