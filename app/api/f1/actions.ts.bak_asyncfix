"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * F1 POINTS MODEL (based on finishing position)
 *
 * 1st: 25
 * 2nd: 20
 * 3rd: 15
 * 4th: 10
 * 5th: 5
 * 6th–10th: 1
 * >10th: 0
 */
function getF1Points(position: number): number {
  if (position === 1) return 25;
  if (position === 2) return 20;
  if (position === 3) return 15;
  if (position === 4) return 10;
  if (position === 5) return 5;
  if (position >= 6 && position <= 10) return 1;
  return 0;
}

/**
 * Submit an F1 pick for the authenticated user.
 */
export async async function submitF1Pick(raceId: string, driverId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  const userId = user.id;

  const { error } = await supabase
    .from("f1_picks")
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
    console.error("Error submitting F1 pick:", error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Get the current F1 leaderboard for a race.
 */
export async async function getF1Leaderboard(raceId?: string) {
  const supabase = await createSupabaseServerClient();

  const query = supabase
    .from("f1_points")
    .select("user_id, race_id, points")
    .order("points", { ascending: false });

  if (raceId) query.eq("race_id", raceId);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching F1 leaderboard:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Get the user's F1 pick for a specific race.
 */
export async async function getUserF1Pick(raceId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("f1_picks")
    .select("*")
    .eq("user_id", user.id)
    .eq("race_id", raceId)
    .single();

  if (error) {
    console.error("Error fetching user F1 pick:", error);
    return null;
  }

  return data;
}

/**
 * Insert or update F1 race results.
 * Each result must include: driver_id, driver_name, finishing_position
 */
export async async function submitF1RaceResults(raceId: string, results: any[]) {
  const supabase = await createSupabaseServerClient();

  const payload = results.map((r) => ({
    race_id: raceId,
    driver_id: r.driver_id,
    driver_name: r.driver_name,
    finishing_position: r.finishing_position,
  }));

  const { error } = await supabase
    .from("f1_driver_performance")
    .upsert(payload, { onConflict: "race_id,driver_id" });

  if (error) {
    console.error("Error inserting F1 results:", error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Calculate points for all users who made picks.
 * Points are based solely on finishing position.
 */
export async async function calculateF1Points(raceId: string) {
  const supabase = await createSupabaseServerClient();

  // Get all picks for this race
  const { data: picks, error: picksError } = await supabase
    .from("f1_picks")
    .select("*")
    .eq("race_id", raceId);

  if (picksError) {
    console.error("Error fetching F1 picks:", picksError);
    return { success: false, error: picksError };
  }

  if (!picks || picks.length === 0) {
    return { success: true, message: "No picks for this race" };
  }

  // Get driver finishing positions
  const { data: perf, error: perfError } = await supabase
    .from("f1_driver_performance")
    .select("*")
    .eq("race_id", raceId);

  if (perfError) {
    console.error("Error fetching F1 performance:", perfError);
    return { success: false, error: perfError };
  }

  const perfMap = new Map();
  perf?.forEach((p) => {
    perfMap.set(p.driver_id, p.finishing_position);
  });

  // Build points payload
  const pointsPayload = picks.map((pick) => {
    const position = perfMap.get(pick.driver_id) ?? 99; // default = last place
    const points = getF1Points(position);

    return {
      user_id: pick.user_id,
      race_id: raceId,
      driver_id: pick.driver_id,
      points,
    };
  });

  const { error: pointsError } = await supabase
    .from("f1_points")
    .insert(pointsPayload);

  if (pointsError) {
    console.error("Error inserting F1 points:", pointsError);
    return { success: false, error: pointsError };
  }

  return { success: true };
}

/**
 * Get all F1 drivers.
 */
export async async function getF1Drivers() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("f1_drivers")
    .select(
      "driver_id, driver_name, number, team, constructor, photo_url"
    )
    .order("number");

  if (error) {
    console.error("Error fetching F1 drivers:", error);
    return null;
  }

  return data;
}
