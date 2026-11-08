import { NextResponse } from "next/server";

// Retired endpoint: it previously wrote a team UUID into winner_to_game_id,
// even though that column must reference a tournament_games.id.
export async function POST() {
  return NextResponse.json(
    {
      error: "This endpoint is retired. Use /api/admin/opening-round/save to save Opening Round matchups safely.",
    },
    { status: 410 }
  );
}
