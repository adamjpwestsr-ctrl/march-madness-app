import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("trivia_questions")
    .select("*")
    .order("sport", { ascending: true });

  return NextResponse.json(data);
}
