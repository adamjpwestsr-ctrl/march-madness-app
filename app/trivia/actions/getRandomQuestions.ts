"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function getRandomQuestions() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("trivia_questions")
    .select("id, sport, question, answer, difficulty, points, category_tag")
    .order("random()")
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data;
}
