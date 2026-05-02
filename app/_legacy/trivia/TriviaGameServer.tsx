export const revalidate = 60; // or 3600, or 86400

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import TriviaGameClient from "./TriviaGameClient";

export default async function TriviaGameServer() {
  const supabase = await createSupabaseServerClient();

  const { data: leaderboard } = await supabase
    .from("trivia_rounds")
    .select("id, display_name, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(10);

  return <TriviaGameClient initialLeaderboard={leaderboard || []} />;
}
