import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function awardNflPoints(userId: string, week: number, correct: boolean) {
  const points = correct ? 1 : 0;

  const { data, error } = await supabase
    .from("nfl_weekly_picks")
    .upsert(
      { user_id: userId, week, points },
      { onConflict: "user_id,week" }
    )
    .select()
    .single();

  if (error) throw error;

  await supabase.rpc("increment_user_totals", {
    p_user_id: userId,
    p_total_delta: points,
    p_nfl_delta: points,
    p_golf_delta: 0,
    p_trivia_delta: 0,
  });

  return data;
}

export async function awardGolfPoints(userId: string, eventId: string, points: number) {
  const { data, error } = await supabase
    .from("golf_weekly_picks")
    .upsert(
      { user_id: userId, event_id: eventId, points },
      { onConflict: "user_id,event_id" }
    )
    .select()
    .single();

  if (error) throw error;

  await supabase.rpc("increment_user_totals", {
    p_user_id: userId,
    p_total_delta: points,
    p_nfl_delta: 0,
    p_golf_delta: points,
    p_trivia_delta: 0,
  });

  return data;
}

export async function awardTriviaPoints(
  userId: string,
  mode: string,
  score: number,
  maxScore: number
) {
  const points = score * 10;

  const { error } = await supabase.from("trivia_results").insert({
    user_id: userId,
    mode,
    score,
    max_score: maxScore,
  });

  if (error) throw error;

  await supabase.rpc("increment_user_totals", {
    p_user_id: userId,
    p_total_delta: points,
    p_nfl_delta: 0,
    p_golf_delta: 0,
    p_trivia_delta: points,
  });
}
