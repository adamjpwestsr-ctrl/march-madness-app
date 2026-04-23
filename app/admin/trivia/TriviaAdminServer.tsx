import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import TriviaAdminClient from "./TriviaAdminClient";

export default async function TriviaAdminServer() {
  const supabase = await createSupabaseServerClient();

  const { count: questionCount } = await supabase
    .from("trivia_questions")
    .select("*", { count: "exact", head: true });

  const { count: roundsCount } = await supabase
    .from("trivia_rounds")
    .select("*", { count: "exact", head: true });

  return (
    <TriviaAdminClient
      questionCount={questionCount ?? 0}
      roundsCount={roundsCount ?? 0}
    />
  );
}
