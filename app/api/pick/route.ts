export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { bracketId, gameId, teamId } = await req.json();

  // 1. Get user_id for this bracket
  const { data: bracket, error: bracketErr } = await supabase
    .from("brackets")
    .select("user_id")
    .eq("bracket_id", bracketId)
    .single();

  if (bracketErr || !bracket) {
    console.error("Bracket lookup failed:", bracketErr);
    return NextResponse.json({ error: "Bracket not found" }, { status: 400 });
  }

  const userId = bracket.user_id!;

  // 2. Save pick
  await supabase.from("picks").upsert(
    {
      user_id: userId,
      bracket_id: bracketId,
      game_id: gameId,
      selected_team: teamId,
    },
    { onConflict: "bracket_id,game_id" }
  );

  // 3. Update winner for this game
  await supabase
    .from("games")
    .update({ winner: teamId })
    .eq("game_id", gameId);

  // 4. Load the current game
  const { data: currentGame } = await supabase
    .from("games")
    .select("*")
    .eq("game_id", gameId)
    .single();

  if (!currentGame) return NextResponse.json({ success: true });

  // 5. Find the NEXT game (the one that depends on THIS game)
  const { data: nextGame } = await supabase
    .from("games")
    .select("*")
    .or(`source_game1.eq.${gameId},source_game2.eq.${gameId}`)
    .single();

  if (!nextGame) {
    // No next game → end of bracket path
    return NextResponse.json({ success: true });
  }

  const nextGameId = nextGame.game_id;

  // 6. Update the correct slot in the next game
  const updateFields: any = {};

  if (nextGame.source_game1 === gameId) {
    updateFields.team1 = teamId;
    updateFields.seed1 = null;
  }

  if (nextGame.source_game2 === gameId) {
    updateFields.team2 = teamId;
    updateFields.seed2 = null;
  }

  if (Object.keys(updateFields).length > 0) {
    await supabase
      .from("games")
      .update(updateFields)
      .eq("game_id", nextGameId);
  }

  // 7. Clear downstream games recursively
  async function clearDownstream(id: number) {
    const { data: g } = await supabase
      .from("games")
      .select("*")
      .eq("game_id", id)
      .single();

    if (!g) return;

    // Clear winner + picks
    await supabase.from("games").update({ winner: null }).eq("game_id", id);

    await supabase
      .from("picks")
      .delete()
      .eq("game_id", id)
      .eq("bracket_id", bracketId);

    // Find the next game that depends on THIS game
    const { data: next } = await supabase
      .from("games")
      .select("*")
      .or(`source_game1.eq.${id},source_game2.eq.${id}`)
      .single();

    if (next) {
      await clearDownstream(next.game_id);
    }
  }

  await clearDownstream(nextGameId);

  return NextResponse.json({ success: true });
}
