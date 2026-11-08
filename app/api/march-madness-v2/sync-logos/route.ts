import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams"
    );

    if (!res.ok) {
      throw new Error(`ESPN request failed: ${res.status}`);
    }

    const json = await res.json();
    const league = json?.sports?.[0]?.leagues?.[0];
    const teams = league?.teams ?? [];

    // ✅ Populate espn_id instead of id
    const updates = teams.map((t: any) => {
      const team = t.team;
      const logo = team.logos?.[0]?.href ?? "/images/logos/default.png";

      return {
        espn_id: team.id.toString(),
        team_name: team.name,
        logo_url: logo,
      };
    });

    const { error: updateError } = await supabase
      .from("tournament_teams")
      .upsert(updates, { onConflict: "espn_id" }); // ensures updates by espn_id

    if (updateError) {
      console.error("Error updating teams:", updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ updated: updates.length });
  } catch (err: any) {
    console.error("Sync failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
