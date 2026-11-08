import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { name, message, thread_id } = await req.json();

  if (!name || !message) {
    return NextResponse.json({ error: "Missing name or message" }, { status: 400 });
  }

  const { error } = await supabase.from("forum_posts").insert({
    display_name: name,
    message,
    thread_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
