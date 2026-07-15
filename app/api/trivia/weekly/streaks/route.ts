import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    // Fetch all streaks, sorted by longest streak first
    const { data: streaks, error } = await supabase
      .from("weekly_streaks")
      .select("*")
      .order("streak", { ascending: false });

    if (error) {
      console.error("Weekly streaks fetch error:", error);
      return NextResponse.json(
        {
          streaks: [],
          error: "Failed to load weekly streaks",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      streaks: streaks ?? [],
    });

  } catch (err) {
    console.error("Weekly streaks route crashed:", err);
    return NextResponse.json(
      {
        streaks: [],
        error: "Server error",
      },
      { status: 500 }
    );
  }
}
