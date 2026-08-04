"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async async function submitPick({
  userId,
  gameId,
  pickTeamId,
  season,
  week,
}: {
  userId: number;
  gameId: number;
  pickTeamId: string;
  season: number;
  week: number;
}) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("ncaaf_picks")
    .upsert({
      user_id: userId,
      game_id: gameId,
      pick_team_id: pickTeamId,
      season,
      week,
    });

  if (error) {
    console.error("NCAAF submitPick error:", error);
    throw new Error("Failed to submit pick");
  }

  return { success: true };
}
