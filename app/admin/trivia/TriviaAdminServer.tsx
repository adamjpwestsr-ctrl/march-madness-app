import { supabaseServerClient } from "@/lib/supabaseServerClient";
import TriviaAdminClient from "./TriviaAdminClient";

export default async function TriviaAdminServer() {
  const supabase = supabaseServerClient();

  if (!supabase) return;
    const { count: questionCount } = await supabase
    .from("trivia_questions")
    .select("*", { count: "exact", head: true });

  if (!supabase) return;
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

