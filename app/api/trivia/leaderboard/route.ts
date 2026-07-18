import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "all";

    let query = supabase.from("trivia_rounds").select("*");

    if (type === "daily") query = query.eq("duration_sec", 60);
    if (type === "weekly") query = query.eq("duration_sec", 120);

    const { data: rounds, error } = await query;

    if (error) {
      console.error("Leaderboard error:", error);
      return NextResponse.json({ error: "Leaderboard error" });
    }

    if (!rounds || rounds.length === 0) {
      return NextResponse.json({ rounds: [] });
    }

    const sorted = [...rounds].sort((a, b) => b.score - a.score);

    const enhanced = sorted.map((r, index) => {
      const rank = index + 1;

      let badge = "Player";
      if (rank === 1) badge = "Gold";
      else if (rank === 2) badge = "Silver";
      else if (rank === 3) badge = "Bronze";
      else if (r.score >= 20) badge = "Rising Star";

      const lastWeek = rounds.filter((x) => {
        const created = new Date(x.created_at);
        const now = new Date();
        const diff = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
        return diff >= 7 && diff < 14;
      });

      let delta = 0;
      if (lastWeek.length > 0) {
        const lastSorted = [...lastWeek].sort((a, b) => b.score - a.score);
        const lastRank =
          lastSorted.findIndex((x) => x.display_name === r.display_name) + 1;
        if (lastRank > 0) delta = lastRank - rank;
      }

      return {
        ...r,
        rank,
        delta,
        badge,
      };
    });

    return NextResponse.json({ rounds: enhanced });
  } catch (err) {
    console.error("Leaderboard route crashed:", err);
    return NextResponse.json({ error: "Route crashed" });
  }
}
