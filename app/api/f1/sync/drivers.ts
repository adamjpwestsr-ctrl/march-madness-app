"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async async function syncF1DriversFromESPN() {
  const supabase = await createSupabaseServerClient();

  const url =
    "https://site.api.espn.com/apis/site/v2/sports/racing/f1/athletes";

  const res = await fetch(url);
  const json = await res.json();

  const athletes = json?.athletes ?? [];

  const payload = athletes.map((a: any) => ({
    driver_id: a.id?.toString(),
    driver_name: a.displayName,
    number: a.jersey ?? null,
    team: a.team?.displayName ?? "",
    constructor: a.team?.abbreviation ?? "",
    photo_url: a.headshot?.href ?? null,
  }));

  const { error } = await supabase
    .from("f1_drivers")
    .upsert(payload, { onConflict: "driver_id" });

  if (error) {
    console.error("Error syncing F1 drivers:", error);
    return { success: false, error };
  }

  return { success: true };
}
