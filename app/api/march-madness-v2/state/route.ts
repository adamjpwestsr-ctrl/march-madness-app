import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const supabase = await createClient(); // IMPORTANT: must await
    const url = new URL(req.url);
    const bracketId = url.searchParams.get("bracket_id");

    if (!bracketId) {
      return NextResponse.json(
        { error: "Missing bracket_id" },
        { status: 400 }
      );
    }

    // Load bracket
    const { data: bracket, error: bracketErr } = await supabase
      .from("brackets")
      .select("*")
      .eq("bracket_id", bracketId)
      .maybeSingle(); // safer than .single()

    if (bracketErr) {
      console.error("STATE bracketErr:", bracketErr);
      return NextResponse.json(
        { error: bracketErr.message },
        { status: 500 }
      );
    }

    if (!bracket) {
      return NextResponse.json(
        { error: "Bracket not found" },
        { status: 404 }
      );
    }

    // Load picks
    const { data: picksData, error: picksErr } = await supabase
      .from("picks")
      .select("*")
      .eq("bracket_id", bracketId);

    if (picksErr) console.error("STATE picksErr:", picksErr);

    const picks = Object.fromEntries(
      (picksData ?? []).map((p) => [p.game_id, p.winner])
    );

    // Load teams
    const { data: teams, error: teamsErr } = await supabase
      .from("teams")
      .select("*");

    if (teamsErr) console.error("STATE teamsErr:", teamsErr);

    // Load games
    const { data: games, error: gamesErr } = await supabase
      .from("games")
      .select("*");

    if (gamesErr) console.error("STATE gamesErr:", gamesErr);

    const safeGames = games ?? [];

    // Round filters (safe even if empty)
    const openingRoundGames = safeGames.filter((g) => g.round === 1);
    const finalFourGames = safeGames.filter((g) => g.round === 6);
    const championshipGames = safeGames.filter((g) => g.round === 7);

    // Regional filters
    const regionalGames = {
      East: safeGames.filter((g) => g.region === "East"),
      West: safeGames.filter((g) => g.region === "West"),
      South: safeGames.filter((g) => g.region === "South"),
      Midwest: safeGames.filter((g) => g.region === "Midwest"),
    };

    // Lock state (safe if column missing)
    const lockState = {
      bracketsOpen: bracket.is_locked ? !bracket.is_locked : true,
    };

    return NextResponse.json({
      bracket,
      picks,
      state: {
        openingRoundGames,
        regionalGames,
        finalFourGames,
        championshipGames,
        teams: teams ?? [],
        lockState,
      },
    });
  } catch (err: any) {
    console.error("STATE ROUTE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
