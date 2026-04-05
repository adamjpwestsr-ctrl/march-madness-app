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

  const { data: bracket, error: bracketErr } = await supabase
    .from("brackets")
    .select("user_id")
    .eq("bracket_id", bracketId)
    .single();

  if (bracketErr || !bracket) {
    console.error("Bracket lookup failed:", bracketErr);
    return NextResponse.json({ error: "Bracket not found" }, { status: 400 });
  }

  const userId = bracket.user_id;

  await supabase.from("picks").upsert(
    {
      user_id: userId,
      bracket_id: bracketId,
      game_id: gameId,
      team_id: teamId,
    },
    {
      onConflict: "bracket_id,game_id",
    }
  );

  await supabase
    .from("games")
    .update({ winner: teamId })
    .eq("game_id", gameId);

  const { data: currentGame } = await supabase
    .from("games")
    .select("*")
    .eq("game_id", gameId)
    .single();

  if (!currentGame) {
    return NextResponse.json({ success: true });
  }

  const nextGameId =
    currentGame.next_game_id ?? currentGame.source_game1 ?? null;

  if (!nextGameId) {
    return NextResponse.json({ success: true });
  }

  const { data: nextGame } = await supabase
    .from("games")
    .select("*")
    .eq("game_id", nextGameId)
    .single();

  if (!nextGame) {
    return NextResponse.json({ success: true });
  }

  const updateFields: any = {};

  if (
    nextGame.source_game1 === currentGame.game_id ||
    nextGame.next_game_id === currentGame.game_id
  ) {
    updateFields.team1 = teamId;
    updateFields.seed1 = null;
  }

  if (nextGame.source_game2 === currentGame.game_id) {
    updateFields.team2 = teamId;
    updateFields.seed2 = null;
  }

  if (Object.keys(updateFields).length > 0) {
    await supabase
      .from("games")
      .update(updateFields)
      .eq("game_id", nextGameId);
  }

  async function clearDownstream(gameIdToClear: number) {
    const { data: g } = await supabase
      .from("games")
      .select("*")
      .eq("game_id", gameIdToClear)
      .single();

    if (!g) return;

    await supabase
      .from("games")
      .update({ winner: null })
      .eq("game_id", gameIdToClear);

    await supabase
      .from("picks")
      .delete()
      .eq("game_id", gameIdToClear)
      .eq("bracket_id", bracketId);

    const nextId = g.next_game_id ?? g.source_game1 ?? null;
    if (nextId) {
      await clearDownstream(nextId);
    }
  }

  await clearDownstream(nextGameId);

  return NextResponse.json({ success: true });
}
