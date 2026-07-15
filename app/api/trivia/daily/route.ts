import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    // 1️⃣ Get total count of trivia questions
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

    // 2️⃣ Pick a random index
    const randomIndex = Math.floor(Math.random() * count);

    // 3️⃣ Fetch exactly that one row
    const { data, error } = await supabase
      .from("trivia_questions")
      .select("*")
      .range(randomIndex, randomIndex); // single row at randomIndex

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

    // 4️⃣ Return the random question
    return NextResponse.json(question);
  } catch (err) {
    console.error("Trivia daily route crashed:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
