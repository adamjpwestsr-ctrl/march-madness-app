import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { bracket_id, picks, email, user_id } = body;

    if (!UUID_RE.test(String(bracket_id || ""))) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid bracket_id" },
        { status: 400 }
      );
    }

    if (!picks || typeof picks !== "object" || Array.isArray(picks)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid picks" },
        { status: 400 }
      );
    }

    if (!email || !user_id) {
      return NextResponse.json(
        { success: false, error: "Missing email or user_id" },
        { status: 400 }
      );
    }

    const { data: bracket, error: bracketError } = await supabase
      .from("brackets")
      .select("bracket_id, user_id")
      .eq("bracket_id", bracket_id)
      .single();

    if (bracketError || !bracket) {
      return NextResponse.json(
        { success: false, error: "Bracket not found" },
        { status: 404 }
      );
    }

    if (String(bracket.user_id) !== String(user_id)) {
      return NextResponse.json(
        { success: false, error: "You can only save picks for your own bracket." },
        { status: 403 }
      );
    }

    const { data: games, error: gamesError } = await supabase
      .from("tournament_games")
      .select("id, round, region")
      .is("bracket_id", null);

    if (gamesError || !games) {
      return NextResponse.json(
        { success: false, error: "Failed to load tournament games" },
        { status: 500 }
      );
    }

    const gameMap = new Map(
      games.map((game) => [
        game.id,
        { round: game.round, region: game.region },
      ])
    );

    const entries = Object.entries(picks).filter(
      ([, teamId]) => teamId !== null && teamId !== undefined && teamId !== ""
    );

    const invalidGame = entries.find(([gameId]) => !gameMap.has(gameId));
    if (invalidGame) {
      return NextResponse.json(
        {
          success: false,
          error: `Game ${invalidGame[0]} is not part of the official March Madness bracket.`,
        },
        { status: 400 }
      );
    }

    const invalidTeam = entries.find(
      ([, teamId]) =>
        typeof teamId !== "string" || !UUID_RE.test(teamId)
    );
    if (invalidTeam) {
      return NextResponse.json(
        {
          success: false,
          error: "A pick is not a valid team ID. Opening Round placeholders cannot be saved as teams.",
        },
        { status: 400 }
      );
    }

    const teamIds = [...new Set(entries.map(([, teamId]) => teamId as string))];
    if (teamIds.length) {
      const { data: validTeams, error: teamsError } = await supabase
        .from("tournament_teams")
        .select("id")
        .in("id", teamIds);

      if (teamsError) {
        return NextResponse.json(
          { success: false, error: "Failed to validate selected teams" },
          { status: 500 }
        );
      }

      const validTeamIds = new Set((validTeams || []).map((team) => team.id));
      const unknownTeam = teamIds.find((id) => !validTeamIds.has(id));

      if (unknownTeam) {
        return NextResponse.json(
          { success: false, error: "A selected team does not exist." },
          { status: 400 }
        );
      }
    }

    const rows = entries.map(([game_id, teamId]) => {
      const meta = gameMap.get(game_id)!;
      return {
        bracket_id,
        game_id,
        picked_team: teamId,
        winner_team_id: teamId,
        round: meta.round,
        region: meta.region,
        email,
        user_id,
      };
    });

    if (rows.length) {
      const { error: upsertError } = await supabase
        .from("bracket_picks")
        .upsert(rows, { onConflict: "bracket_id,game_id" });

      if (upsertError) {
        return NextResponse.json(
          { success: false, error: upsertError.message },
          { status: 500 }
        );
      }
    }

    let deleteQuery = supabase
      .from("bracket_picks")
      .delete()
      .eq("bracket_id", bracket_id);

    if (entries.length) {
      deleteQuery = deleteQuery.not(
        "game_id",
        "in",
        `(${entries.map(([gameId]) => gameId).join(",")})`
      );
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}