import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const weekStart = getWeekStart();

  try {
    // Fetch weekly results row
    const { data, error } = await supabase
      .from("weekly_results")
      .select("*")
      .eq("week", weekStart)
      .maybeSingle();

    if (error) {
      console.error("Weekly results fetch error:", error);
      return NextResponse.json(
        {
          week: weekStart,
          winning_team_ids: [],
          error: "Failed to load weekly results",
        },
        { status: 500 }
      );
    }

    // No results yet for this week
    if (!data) {
      return NextResponse.json({
        week: weekStart,
        winning_team_ids: [],
        message: "No weekly results available yet",
      });
    }

    // Return results
    return NextResponse.json({
      week: data.week,
      winning_team_ids: data.winning_team_ids ?? [],
      created_at: data.created_at ?? null,
    });

  } catch (err) {
    console.error("Weekly results route crashed:", err);
    return NextResponse.json(
      {
        week: weekStart,
        winning_team_ids: [],
        error: "Server error",
      },
      { status: 500 }
    );
  }
}
