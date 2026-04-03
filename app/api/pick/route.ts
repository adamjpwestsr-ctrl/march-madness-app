import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { bracketId, gameId, teamId } = await req.json();

  // ------------------------------------------------------------
  // 1. SAVE PICK
  // ------------------------------------------------------------
  await supabase.from("picks").upsert(
    {
      bracket_id: bracketId,
      game_id: gameId,
      team_id: teamId, // team name
    },
    {
      onConflict: "bracket_id,game_id",
    }
  );

  // ------------------------------------------------------------
  // 2. UPDATE WINNER IN CURRENT GAME
  // ------------------------------------------------------------
  await supabase
    .from("games")
    .update({ winner: teamId })
    .eq("game_id", gameId);

  // ------------------------------------------------------------
  // 3. DOWNSTREAM PROPAGATION
  // ------------------------------------------------------------
  // Load the game we just updated
  const { data: currentGame } = await supabase
    .from("games")
    .select("*")
    .eq("game_id", gameId)
    .single();

  if (!currentGame) {
    return NextResponse.json({ success: true });
  }

  // Determine the next game this feeds into
  const nextGameId = currentGame.source_game1 || currentGame.source_game2;

  if (!nextGameId) {
    // No downstream game (Final Four or Championship)
    return NextResponse.json({ success: true });
  }

  // Load the next game
  const { data: nextGame } = await supabase
    .from("games")
    .select("*")
    .eq("game_id", nextGameId)
    .single();

  if (!nextGame) {
    return NextResponse.json({ success: true });
  }

  // ------------------------------------------------------------
  // 4. PLACE WINNER INTO NEXT GAME
  // ------------------------------------------------------------
  let updateFields: any = {};

  // If this game is source_game1 for the next game → fill team1
  if (nextGame.source_game1 === currentGame.game_id) {
    updateFields.team1 = teamId;
    updateFields.seed1 = null; // optional: clear seed
  }

  // If this game is source_game2 for the next game → fill team2
  if (nextGame.source_game2 === currentGame.game_id) {
    updateFields.team2 = teamId;
    updateFields.seed2 = null;
  }

  // Update the next game with the new team
  await supabase
    .from("games")
    .update(updateFields)
    .eq("game_id", nextGameId);

  // ------------------------------------------------------------
  // 5. CLEAR DOWNSTREAM WINNERS (invalidate future rounds)
  // ------------------------------------------------------------
  async function clearDownstream(gameId: number) {
    const { data: g } = await supabase
      .from("games")
      .select("*")
      .eq("game_id", gameId)
      .single();

    if (!g) return;

    // Clear winner
    await supabase
      .from("games")
      .update({ winner: null })
      .eq("game_id", gameId);

    // Clear picks for this game
    await supabase
      .from("picks")
      .delete()
      .eq("game_id", gameId)
      .eq("bracket_id", bracketId);

    // Recurse into next game
    const nextId = g.source_game1 || g.source_game2;
    if (nextId) {
      await clearDownstream(nextId);
    }
  }

  // Clear downstream winners starting from the next game
  await clearDownstream(nextGameId);

  return NextResponse.json({ success: true });
}
