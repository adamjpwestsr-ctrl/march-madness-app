"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Submit a NASCAR pick for a user.
 */
export async function submitNascarPick(userId: string, raceId: string, driverId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("nascar_picks")
    .upsert({
      user_id: userId,
      race_id: raceId,
      driver_id: driverId,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error submitting NASCAR pick:", error);
    throw new Error("Failed to submit NASCAR pick");
  }

  return { success: true };
}

/**
 * Get the current NASCAR leaderboard.
 */
export async function getNascarLeaderboard() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("nascar_points")
    .select("user_id, race_id, points")
    .order("points", { ascending: false });

  if (error) {
    console.error("Error fetching NASCAR leaderboard:", error);
    throw new Error("Failed to fetch NASCAR leaderboard");
  }

  return data;
}

/**
 * Get the user's pick for a specific race.
 */
export async function getUserNascarPick(userId: string, raceId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("nascar_picks")
    .select("*")
    .eq("user_id", userId)
    .eq("race_id", raceId)
    .single();

  if (error) {
    console.error("Error fetching user NASCAR pick:", error);
    return null;
  }

  return data;
}
