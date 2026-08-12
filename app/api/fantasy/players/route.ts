// app/api/fantasy/players/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(req.url);

    // Optional filters
    const position = searchParams.get("position");
    const team = searchParams.get("team");

    // Optional sorting
    const sort = searchParams.get("sort") || "name"; // name | projected_points | position
    const direction = searchParams.get("direction") === "desc" ? false : true;

    let query = supabase
      .from("nfl_players")
      .select(
        `
        id,
        name,
        position,
        team,
        bye_week,
        projected_points
      `
      );

    // Apply filters
    if (position) {
      query = query.eq("position", position.toUpperCase());
    }

    if (team) {
      query = query.eq("team", team.toUpperCase());
    }

    // Apply sorting
    query = query.order(sort, { ascending: direction });

    const { data, error } = await query;

    if (error) {
      console.error("Player fetch error:", error);
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      count: data?.length || 0,
      players: data || [],
    });
  } catch (err: any) {
    console.error("Players API failure:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
