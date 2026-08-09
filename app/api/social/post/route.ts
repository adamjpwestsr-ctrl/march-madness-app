import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { userId, content, sport } = body;

  await supabase.from("posts").insert({
    user_id: userId,
    content,
    sport_tag: sport,
  });

  return NextResponse.json({ status: "success" });
}
