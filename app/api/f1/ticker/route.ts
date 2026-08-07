import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Get races from last 48 hours
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: races } = await supabase
    .from("f1_races")
    .select("*")
    .gte("date", since)
    .order("date", { ascending: false });

  if (!races || races.length === 0) {
    return NextResponse.json([]);
  }

  const { data: perf } = await supabase
    .from("f1_driver_performance")
    .select("race_id, driver_id, driver_name, finishing_position");

  const { data: points } = await supabase
    .from("f1_points")
    .select("race_id, driver_id, points");

  const rows: any[] = [];

  // ⭐ FIX — type "race"
  races.forEach((race: any) => {
    // ⭐ FIX — type "p"
    const racePerf = perf?.filter((p: any) => p.race_id === race.race_id) || [];

    // ⭐ FIX — type "p"
    const racePoints = points?.filter((p: any) => p.race_id === race.race_id) || [];

    // ⭐ FIX — type "p"
    racePerf.forEach((p: any) => {
      // ⭐ FIX — type "pt"
      const userPoints = racePoints.find((pt: any) => pt.driver_id === p.driver_id);

      rows.push({
        race_id: race.race_id,
        race_name: race.name,
        date: race.date,
        driver_name: p.driver_name,
        finishing_position: p.finishing_position,
        points: userPoints?.points ?? 0,
      });
    });
  });

  return NextResponse.json(rows);
}
