"use server";

import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function injectOpeningRoundWinner(openingRoundGameId: string, winnerTeamId: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {}
      }
    }
  );

  // 1. Look up mapping
  const { data: slot, error: slotError } = await supabase
    .from("opening_round_slots")
    .select("*")
    .eq("opening_round_game_id", openingRoundGameId)
    .single();

  if (slotError || !slot) {
    throw new Error("No mapping found for this Opening Round game");
  }

  // 2. Update the Round of 64 game
  const updateField = slot.slot_position === 1 ? "team1_id" : "team2_id";

  const { error: updateError } = await supabase
    .from("games")
    .update({
      [updateField]: winnerTeamId,
      is_placeholder: false,
    })
    .eq("id", slot.round_of_64_game_id);

  if (updateError) {
    throw new Error("Failed to inject Opening Round winner");
  }

  return { success: true };
}
