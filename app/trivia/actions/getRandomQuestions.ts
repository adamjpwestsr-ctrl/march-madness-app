"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function getRandomQuestions() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc(
    "get_random_trivia_questions",
    { count: 50 }
  );

  if (error || !data) {
    console.error("Trivia fetch error:", error);
    return [];
  }

  return data;
}
