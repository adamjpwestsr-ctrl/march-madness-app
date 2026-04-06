import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // -----------------------------
  // AUTH: Read mm_session cookie
  // -----------------------------
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const userId = session.userId;
  const isAdmin = session.isAdmin === true;

  // -----------------------------
  // Parse request body
  // -----------------------------
  const { bracketId, picks, tiebreaker } = await req.json();

  if (!bracketId || !Array.isArray(picks)) {
    return NextResponse.json(
      { error: "Missing bracketId or picks" },
      { status: 400 }
    );
  }

  // -----------------------------
  // FETCH LOCK DATE
  // -----------------------------
  const { data: settings } = await supabase
    .from("settings")
    .select("lock_date")
    .eq("id", 1)
    .single();

  const lockDateUTC = settings?.lock_date
    ? new Date(settings.lock_date)
    : null;

  const nowUTC = new Date();

  // -----------------------------
  // ENFORCE LOCK DATE (non-admin)
  // -----------------------------
  if (!isAdmin && lockDateUTC && nowUTC > lockDateUTC) {
    return NextResponse.json(
      { error: "Bracket submissions are locked" },
      { status: 403 }
    );
  }

  // -----------------------------
  // FIXED: VALIDATE CHAMPION PICK
  // -----------------------------
  const { data: champGame, error: champErr } = await supabase
    .from("games")
    .select("game_id")
    .eq("round", 6)
    .single();

  if (champErr || !champGame) {
    return NextResponse.json(
      { error: "Championship game not found" },
      { status: 500 }
    );
  }

  const championshipPick = picks.find(
    (p: any) => p.game_id === champGame.game_id
  );

  if (!championshipPick || !championshipPick.selected_team) {
    return NextResponse.json(
      { error: "Champion pick is required" },
      { status: 400 }
    );
  }

  // -----------------------------
  // SAVE TIEBREAKER
  // -----------------------------
  if (typeof tiebreaker === "number") {
    await supabase
      .from("brackets")
      .update({ tiebreaker })
      .eq("bracket_id", bracketId);
  }

  // -----------------------------
  // SAVE PICKS (UPSERT)
  // -----------------------------
  const formattedPicks = picks.map((p: any) => ({
    bracket_id: bracketId,
    game_id: p.game_id,
    selected_team: p.selected_team,
  }));

  const { error: pickErr } = await supabase
    .from("picks")
    .upsert(formattedPicks, {
      onConflict: "bracket_id,game_id",
    });

  if (pickErr) {
    console.error("Pick save error:", pickErr);
    return NextResponse.json(
      { error: "Failed to save picks" },
      { status: 500 }
    );
  }

  // -----------------------------
  // CLEAR DOWNSTREAM PICKS
  // -----------------------------
  const gameIds = picks.map((p: any) => p.game_id);

  const { data: affectedGames } = await supabase
    .from("games")
    .select("*")
    .in("game_id", gameIds);

  if (affectedGames) {
    const downstreamGameIds = affectedGames
      .map((g) => g.next_game_id)
      .filter(Boolean);

    if (downstreamGameIds.length > 0) {
      await supabase
        .from("picks")
        .delete()
        .eq("bracket_id", bracketId)
        .in("game_id", downstreamGameIds);
    }
  }

  // -----------------------------
  // PROPAGATE WINNERS TO NEXT ROUND
  // -----------------------------
  for (const p of picks) {
    if (!p.selected_team) continue;

    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("game_id", p.game_id)
      .single();

    if (!game?.next_game_id) continue;

    const nextGameId = game.next_game_id;

    await supabase
      .from("picks")
      .upsert(
        [
          {
            bracket_id: bracketId,
            game_id: nextGameId,
            selected_team: p.selected_team,
          },
        ],
        { onConflict: "bracket_id,game_id" }
      );
  }

  // -----------------------------
  // SUCCESS
  // -----------------------------
  return NextResponse.json({ success: true });
}
