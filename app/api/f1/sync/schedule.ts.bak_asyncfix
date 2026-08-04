"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async async function syncF1ScheduleFromESPN() {
  const supabase = await createSupabaseServerClient();

  const url =
    "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard";

  const res = await fetch(url);
  const json = await res.json();

  const events = json?.events ?? [];

  const payload = events.map((e: any) => ({
    race_id: e.id?.toString(),
    name: e.name,
    date: e.date,
    circuit: e.venue?.fullName ?? "",
    location: e.venue?.address?.city ?? "",
    round: e.competitions?.[0]?.status?.type?.detail ?? "",
  }));

  const { error } = await supabase
    .from("f1_races")
    .upsert(payload, { onConflict: "race_id" });

  if (error) {
    console.error("Error syncing F1 schedule:", error);
    return { success: false, error };
  }

  return { success: true };
}
