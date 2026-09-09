import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function savePicks({
  userId,
  seasonYear,
  groupId,
  picks,
}: {
  userId: string;
  seasonYear: number;
  groupId: string | null;
  picks: {
    gameId: string;
    selectedTeamId: string;
  }[];
}) {
  const supabase = await createSupabaseServerClient();

  // Delete old picks for this user/season/group
  await supabase
    .from("mm_picks")
    .delete()
    .eq("user_id", userId)
    .eq("season_year", seasonYear)
    .eq("group_id", groupId);

  // Insert new picks
  const { error } = await supabase.from("mm_picks").insert(
    picks.map((p) => ({
      user_id: userId,
      season_year: seasonYear,
      group_id: groupId,
      game_id: p.gameId,
      selected_team_id: p.selectedTeamId,
    }))
  );

  if (error) {
    console.error("Failed to save picks:", error);
    throw new Error("Failed to save picks");
  }

  return { success: true };
}
