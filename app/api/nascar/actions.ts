"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Submit a NASCAR pick for the authenticated user.
 */
export async function submitNascarPick(raceId: string, driverId: string) {
  const supabase = await createSupabaseServerClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  const userId = user.id;

  // UPSERT pick (correct conflict target)
  const { error } = await supabase
    .from("nascar_picks")
    .upsert(
      {
        user_id: userId,
        race_id: raceId,
        driver_id: driverId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,race_id" }
    );

  if (error) {
    console.error("Error submitting NASCAR pick:", error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Get the current NASCAR leaderboard for a race.
 */
export async function getNascarLeaderboard(raceId?: string) {
  const supabase = await createSupabaseServerClient();

  const query = supabase
    .from("nascar_points")
    .select("user_id, race_id, points")
    .order("points", { ascending: false });

  if (raceId) query.eq("race_id", raceId);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching NASCAR leaderboard:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Get the user's pick for a specific race.
 */
export async function getUserNascarPick(raceId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("nascar_picks")
    .select("*")
    .eq("user_id", user.id)
    .eq("race_id", raceId)
    .single();

  if (error) {
    console.error("Error fetching user NASCAR pick:", error);
    return null;
  }

  return data;
}

/**
 * Insert or update race results.
 */
export async function submitNascarRaceResults(raceId: string, results: any[]) {
  const supabase = await createSupabaseServerClient();

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
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Calculate points for all users who made picks.
 */
export async function calculateNascarPoints(raceId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: picks, error: picksError } = await supabase
    .from("nascar_picks")
    .select("*")
    .eq("race_id", raceId);

  if (picksError) {
    console.error("Error fetching NASCAR picks:", picksError);
    return { success: false, error: picksError };
  }

  if (!picks || picks.length === 0) {
    return { success: true, message: "No picks for this race" };
  }

  const { data: perf, error: perfError } = await supabase
    .from("nascar_driver_performance")
    .select("*")
    .eq("race_id", raceId);

  if (perfError) {
    console.error("Error fetching NASCAR performance:", perfError);
    return { success: false, error: perfError };
  }

  const perfMap = new Map();
  perf?.forEach((p) => {
    perfMap.set(p.driver_id, p.total_points);
  });

  const pointsPayload = picks.map((pick) => ({
    user_id: pick.user_id,
    race_id: raceId,
    driver_id: pick.driver_id,
    points: perfMap.get(pick.driver_id) || 0,
  }));

  const { error: pointsError } = await supabase
    .from("nascar_points")
    .insert(pointsPayload);

  if (pointsError) {
    console.error("Error inserting NASCAR points:", pointsError);
    return { success: false, error: pointsError };
  }

  return { success: true };
}

/**
 * Get all NASCAR drivers.
 */
export async function getNascarDrivers() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("nascar_drivers")
    .select(
      "driver_id, driver_name, number, team, manufacturer, photo_url"
    )
    .order("number");

  if (error) {
    console.error("Error fetching NASCAR drivers:", error);
    return null;
  }

  return data;
}
