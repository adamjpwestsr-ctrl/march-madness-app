"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function clearLeaderboard() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("trivia_rounds").delete().neq("id", 0);

  if (error) {
    return { ok: false, message: "Failed to clear leaderboard." };
  }

  return { ok: true, message: "Leaderboard cleared." };
}
