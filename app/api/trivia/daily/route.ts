import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Determine today's date
    const today = new Date().toISOString().split("T")[0];

    // 2. Load today's daily set (array of question IDs)
    const { data: dailySet, error: setError } = await supabase
      .from("trivia_daily_sets")
      .select("question_ids")
      .eq("date", today)
      .maybeSingle();

    if (setError) {
      console.error("Daily set error:", setError);
      return NextResponse.json({ error: "Daily set error" });
    }

    if (!dailySet || !dailySet.question_ids || dailySet.question_ids.length === 0) {
      return NextResponse.json({ error: "No daily questions available" });
    }

    // 3. Pick a random question ID from the set
    const ids = dailySet.question_ids;
    const randomId = ids[Math.floor(Math.random() * ids.length)];

    // 4. Fetch the actual question from the master table
    const { data: question, error: questionError } = await supabase
      .from("trivia_questions")
      .select("*")
      .eq("id", randomId)
      .maybeSingle();

    if (questionError) {
      console.error("Daily question fetch error:", questionError);
      return NextResponse.json({ error: "Failed to fetch daily question" });
    }

    if (!question) {
      return NextResponse.json({ error: "Daily question not found" });
    }

    // 5. Return the final question object
    return NextResponse.json({ question });

  } catch (err) {
    console.error("Trivia daily route crashed:", err);
    return NextResponse.json({ error: "Route crashed" });
  }
}
