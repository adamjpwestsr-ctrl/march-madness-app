
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();

    const {
      user_name,
      username,
      email,
      passcode,
      bracket_name,
      icon,
      tiebreaker_score,
    } = body;

    // --- VALIDATION ---
    const resolvedUserName =
      typeof user_name === "string" && user_name.trim()
        ? user_name.trim()
        : typeof username === "string"
          ? username.trim()
          : "";

    if (!resolvedUserName) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (typeof passcode !== "string" || !passcode.trim()) {
      return NextResponse.json(
        { error: "Passcode is required." },
        { status: 400 }
      );
    }

    if (typeof bracket_name !== "string" || !bracket_name.trim()) {
      return NextResponse.json(
        { error: "Bracket name is required." },
        { status: 400 }
      );
    }

    // March Madness V2 has one shared official game tree. Player brackets store
    // predictions in bracket_picks; they must not create private copies of games.
    const { data: officialGames, error: officialGamesError } = await supabase
      .from("tournament_games")
      .select("id, round, game_number, region, team1_id, team2_id, winner_to_game_id")
      .is("bracket_id", null);

    if (officialGamesError) {
      console.error("Official tournament tree lookup error:", officialGamesError);
      return NextResponse.json(
        { error: "Unable to verify the official tournament setup. Please try again later." },
        { status: 500 }
      );
    }

    const games = officialGames ?? [];
    const roundCounts = new Map<number, number>();
    for (const game of games) {
      roundCounts.set(game.round, (roundCounts.get(game.round) ?? 0) + 1);
    }

    const expectedRoundCounts: Record<number, number> = {
      0: 12, // Opening Round
      1: 32, // Round of 64
      2: 16, // Round of 32
      3: 8,  // Sweet 16
      4: 4,  // Elite 8
      5: 2,  // Final Four
      6: 1,  // Championship
    };

    const byId = new Map(games.map((game) => [game.id, game]));
    const openingGames = games.filter((game) => game.round === 0);
    const round64Games = games.filter((game) => game.round === 1);
    const openingMappingsValid = openingGames.every((game) => {
      const destination = game.winner_to_game_id ? byId.get(game.winner_to_game_id) : undefined;
      return Boolean(
        game.team1_id && game.team2_id && destination && destination.round === 1 &&
        destination.team1_id && destination.region
      );
    });

    const round64MappingsValid = round64Games.every((game) => {
      if (!game.team1_id || !game.region) return false;
      if (game.team2_id) return true;
      // A Round-of-64 Team 2 slot may remain empty until its Opening Round game
      // is played, but only when exactly one Opening Round game feeds that slot.
      const feeders = openingGames.filter((opening) => opening.winner_to_game_id === game.id);
      return feeders.length === 1;
    });

    const downstreamLinksValid = games
      .filter((game) => game.round >= 1 && game.round <= 5)
      .every((game) => {
        const destination = game.winner_to_game_id ? byId.get(game.winner_to_game_id) : undefined;
        return Boolean(destination && destination.round === game.round + 1);
      });

    const officialTreeIsValid =
      games.length === 75 &&
      Object.entries(expectedRoundCounts).every(
        ([round, expected]) => roundCounts.get(Number(round)) === expected
      ) &&
      openingMappingsValid &&
      round64MappingsValid &&
      downstreamLinksValid;

    if (!officialTreeIsValid) {
      return NextResponse.json(
        {
          error: "The official March Madness tournament is not ready yet. Save the Opening Round and Round of 64, then use Create Missing Game Slots in the admin Full Bracket Editor. Later-round team winners do not need to be selected in advance.",
          expected: expectedRoundCounts,
          actual: Object.fromEntries(roundCounts),
          actualTotal: games.length,
          checks: {
            openingMappingsValid,
            round64MappingsValid,
            downstreamLinksValid,
          },
        },
        { status: 409 }
      );
    }

    // --- LOOK UP USER BY EMAIL ---
    const { data: userRecord, error: userLookupError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email.trim())
      .single();

    if (userLookupError || !userRecord) {
      console.error("User lookup error:", userLookupError);

      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 400 }
      );
    }

    const user_id = userRecord.user_id;

    // --- CREATE BRACKET ---
    const bracket_id = crypto.randomUUID();

    const { data: bracketData, error: bracketError } = await supabase
      .from("brackets")
      .insert({
        bracket_id,
        sport: "ncaab",
        user_id,
        user_name: resolvedUserName,
        email: email.trim(),
        passcode: passcode.trim(),
        bracket_name: bracket_name.trim(),
        icon: icon || null,
        tiebreaker_score:
          tiebreaker_score !== undefined &&
          tiebreaker_score !== null &&
          String(tiebreaker_score).trim() !== ""
            ? Number(tiebreaker_score)
            : null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (bracketError) {
      console.error("Bracket create error:", bracketError);

      return NextResponse.json(
        { error: bracketError.message },
        { status: 500 }
      );
    }

    // No tournament_games rows are inserted here. The shared official tree is
    // owned by the admin workflow; bracket_picks stores each player's choices.

    // --- RETURN SUCCESS ---
    return NextResponse.json({
      success: true,
      bracket: bracketData,
      bracket_id,
    });
  } catch (err: unknown) {
    console.error("Create bracket route error:", err);

    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
