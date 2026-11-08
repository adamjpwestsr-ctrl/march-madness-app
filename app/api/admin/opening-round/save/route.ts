import { NextResponse } from "next/server";
import { requireMarchMadnessAdmin } from "@/lib/march-madness-v2/requireAdmin";

type OpeningGameInput = {
  id?: string;
  game_number: number;
  team1_id: string | null;
  team2_id: string | null;
};

export async function POST(req: Request) {
  const auth = await requireMarchMadnessAdmin();

  if (!auth.ok) return auth.response;

  const { supabase } = auth;

  try {
    const body = await req.json();
    const games = body.games as OpeningGameInput[];

    if (!Array.isArray(games) || games.length !== 12) {
      return NextResponse.json(
        {
          success: false,
          error: "Expected exactly 12 Opening Round games.",
        },
        { status: 400 }
      );
    }

    const numbers = games.map((game) => game.game_number);

    if (
      new Set(numbers).size !== 12 ||
      numbers.some(
        (number) =>
          !Number.isInteger(number) ||
          number < 1 ||
          number > 12
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Opening Round game numbers must be unique values from 1 through 12.",
        },
        { status: 400 }
      );
    }

    const ids = games.flatMap((game) => [
      game.team1_id,
      game.team2_id,
    ]);

    if (ids.some((id) => !id) || new Set(ids).size !== 24) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Choose 24 distinct Opening Round teams, exactly two per game.",
        },
        { status: 400 }
      );
    }

    const { data: teams, error: teamError } = await supabase
      .from("tournament_teams")
      .select("id, region, seed")
      .in("id", ids as string[]);

    if (teamError) throw teamError;

    const validIds = new Set(
      (teams ?? [])
        .filter(
          (team) =>
            team.region === null && team.seed === null
        )
        .map((team) => team.id)
    );

    if (ids.some((id) => !id || !validIds.has(id))) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Opening Round participants must be selected from the 24 unseeded Opening Round teams.",
        },
        { status: 400 }
      );
    }

    const { data: existingGames, error: existingError } =
      await supabase
        .from("tournament_games")
        .select(
          "id, game_number, team1_id, team2_id, winner, winner_to_game_id, home_score, away_score, status, completed"
        )
        .eq("round", 0)
        .is("bracket_id", null);

    if (existingError) throw existingError;

    const existingByNumber = new Map(
      (existingGames ?? []).map((game) => [
        game.game_number,
        game,
      ])
    );

    // Never silently invalidate an official winner.
    for (const input of games) {
      const existing = existingByNumber.get(input.game_number);

      const participantsChanged = Boolean(
        existing &&
          (existing.team1_id !== input.team1_id ||
            existing.team2_id !== input.team2_id)
      );

      if (existing?.winner && participantsChanged) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Reset the official result for Opening Round game ${input.game_number} before changing its teams.`,
          },
          { status: 409 }
        );
      }
    }

    const payload = games.map((input) => {
      const existing = existingByNumber.get(input.game_number);

      const changed =
        !existing ||
        existing.team1_id !== input.team1_id ||
        existing.team2_id !== input.team2_id;

      return {
        id: existing?.id ?? crypto.randomUUID(),
        game_number: input.game_number,
        round: 0,
        region: null,
        team1_id: input.team1_id,
        team2_id: input.team2_id,

        // This page does not edit advancement destinations.
        // Preserve each existing Round-of-64 link as-is.
        winner_to_game_id:
          existing?.winner_to_game_id ?? null,

        bracket_id: null,
        home_score: changed ? 0 : existing.home_score,
        away_score: changed ? 0 : existing.away_score,
        winner: changed ? null : existing.winner,
        status: changed ? "pre" : existing.status,
        completed: changed ? false : existing.completed,
        is_placeholder: false,
      };
    });

    const { error: saveError } = await supabase
      .from("tournament_games")
      .upsert(payload, { onConflict: "id" });

    if (saveError) throw saveError;

    return NextResponse.json({
      success: true,
      saved: payload.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to save Opening Round games.";

    console.error("Opening Round save error:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}