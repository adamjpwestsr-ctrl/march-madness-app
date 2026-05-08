import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: question, error } = await supabase
    .from("trivia_daily_questions")
    .select("*")
    .order("random()")
    .limit(1)
    .single();

  if (error) {
    console.error("Trivia daily - select error:", error);
  }

  if (!question) {
    return NextResponse.json(
      { error: "No trivia questions available" },
      { status: 400 }
    );
  }

  return NextResponse.json(question);
}
