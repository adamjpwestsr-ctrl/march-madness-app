"use server";

import { createClient } from "@/lib/supabaseServerClient";

//
// 1. Insert or update race results
//
export async function submitNascarRaceResults(raceId: string, results: any[]) {
  const supabase = createClient();

  // results = array of:
  // {
  //   driver_id: string,
  //   driver_name: string,
  //   led_laps: boolean,
  //   stage_wins: number,
  //   race_win: boolean
  // }

  const payload = results.map((r) => ({
    race_id: raceId,
    driver_id: r.driver_id,
    driver_name: r.driver_name,
    led_laps: r.led_laps,
    stage_wins: r.stage_wins,
    race_win: r.race_win,
  }));

  const { error } = await supabase
    .from("nascar_driver_performance")
    .upsert(payload, { onConflict: "race_id,driver_id" });

  if (error) {
    console.error("Error inserting NASCAR results:", error);
    throw new Error("Failed to submit NASCAR results");
  }

  return { success: true };
}

//
// 2. Calculate points for all users who made picks
//
export async function calculateNascarPoints(raceId: string) {
  const supabase = createClient();

  // Get all picks for this race
  const { data: picks, error: picksError } = await supabase
    .from("nascar_picks")
    .select("*")
    .eq("race_id", raceId);

  if (picksError) {
    console.error("Error fetching NASCAR picks:", picksError);
    throw new Error("Failed to fetch picks");
  }

  if (!picks || picks.length === 0) {
    return { success: true, message: "No picks for this race" };
  }

  // Get driver performance for this race
  const { data: perf, error: perfError } = await supabase
    .from("nascar_driver_performance")
    .select("*")
    .eq("race_id", raceId);

  if (perfError) {
    console.error("Error fetching NASCAR performance:", perfError);
    throw new Error("Failed to fetch performance");
  }

  // Build a lookup map
  const perfMap = new Map();
  perf?.forEach((p) => {
    perfMap.set(p.driver_id, p.total_points);
  });

  // Build points payload
  const pointsPayload = picks.map((pick) => ({
    user_id: pick.user_id,
    race_id: raceId,
    driver_id: pick.driver_id,
    points: perfMap.get(pick.driver_id) || 0,
  }));

  // Insert points
  const { error: pointsError } = await supabase
    .from("nascar_points")
    .insert(pointsPayload);

  if (pointsError) {
    console.error("Error inserting NASCAR points:", pointsError);
    throw new Error("Failed to insert points");
  }

  return { success: true };
}

//
// 3. User makes a pick
//
export async function submitNascarPick(userId: string, raceId: string, driverId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("nascar_picks")
    .upsert(
      {
        user_id: userId,
        race_id: raceId,
        driver_id: driverId,
      },
      { onConflict: "user_id,race_id" }
    );

  if (error) {
    console.error("Error submitting NASCAR pick:", error);
    throw new Error("Failed to submit pick");
  }

  return { success: true };
}

//
// 4. Get leaderboard
//
export async function getNascarLeaderboard() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("nascar_leaderboard")
    .select("*")
    .order("total_points", { ascending: false });

  if (error) {
    console.error("Error fetching NASCAR leaderboard:", error);
    throw new Error("Failed to fetch leaderboard");
  }

  return data;
}
