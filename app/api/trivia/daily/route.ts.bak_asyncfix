import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async async function GET() {
  const supabase = await createSupabaseServerClient();

  // 1) Get total count of trivia questions
  const { count, error: countError } = await supabase
    .from("trivia_questions")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Trivia daily - count error:", countError);
    return NextResponse.json(
      { error: "Failed to count trivia questions" },
      { status: 500 }
    );
  }

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "No trivia questions available" },
      { status: 404 }
    );
  }

  // 2) Pick a random index
  const randomIndex = Math.floor(Math.random() * count);

  // 3) Fetch exactly that one row
  const { data, error } = await supabase
  .from("trivia_questions")
  .select("*")
  .order("id", { ascending: true })   // ⭐ forces safe ordering
  .range(randomIndex, randomIndex);

  if (error) {
    console.error("Trivia daily - select error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trivia question" },
      { status: 500 }
    );
  }

  const question = data?.[0];

  if (!question) {
    return NextResponse.json(
      { error: "No trivia questions available" },
      { status: 404 }
    );
  }

  // ⭐ LOG THE QUESTION SHAPE
  console.log("TRIVIA DAILY QUESTION:", question);

  // 4) Return the random question
  return NextResponse.json(question);
}
