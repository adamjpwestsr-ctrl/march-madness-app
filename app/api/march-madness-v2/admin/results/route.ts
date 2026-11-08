import { NextResponse } from "next/server";
import { requireMarchMadnessAdmin } from "@/lib/march-madness-v2/requireAdmin";

export async function POST(req: Request) {
  const auth = await requireMarchMadnessAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth;

  try {
    const body = await req.json();

    const gameId =
      typeof body.game_id === "string" ? body.game_id : "";

    const hasTeam1Score =
      body.team1_score !== undefined &&
      body.team1_score !== null &&
      body.team1_score !== "";

    const hasTeam2Score =
      body.team2_score !== undefined &&
      body.team2_score !== null &&
      body.team2_score !== "";

    const team1Score = Number(body.team1_score);
    const team2Score = Number(body.team2_score);

    if (!gameId) {
      return NextResponse.json(
        { error: "A game ID is required." },
        { status: 400 }
      );
    }

    if (
      !hasTeam1Score ||
      !hasTeam2Score ||
      !Number.isInteger(team1Score) ||
      !Number.isInteger(team2Score) ||
      team1Score < 0 ||
      team2Score < 0
    ) {
      return NextResponse.json(
        {
          error: "Enter a nonnegative whole-number score for both teams.",
        },
        { status: 400 }
      );
    }

    if (team1Score === team2Score) {
      return NextResponse.json(
        {
          error:
            "A completed game cannot have a tied score. Enter the final score after any overtime.",
        },
        { status: 400 }
      );
    }

    const { data: game, error: gameError } = await supabase
      .from("tournament_games")
      .select(
        "id, game_number, round, region, team1_id, team2_id, winner, winner_to_game_id, completed"
      )
      .eq("id", gameId)
      .is("bracket_id", null)
      .maybeSingle();

    if (gameError) throw gameError;

    if (!game) {
      return NextResponse.json(
        { error: "Tournament game not found." },
        { status: 404 }
      );
    }

    if (
      !game.team1_id ||
      !game.team2_id ||
      game.team1_id.startsWith("opening-") ||
      game.team2_id.startsWith("opening-")
    ) {
      return NextResponse.json(
        {
          error:
            "Both actual teams must be assigned before recording a final score.",
        },
        { status: 409 }
      );
    }

    if (game.round < 0 || game.round > 6) {
      return NextResponse.json(
        { error: "This tournament round is not supported." },
        { status: 400 }
      );
    }

    const winnerTeamId =
      team1Score > team2Score ? game.team1_id : game.team2_id;

    let advancedToGameId: string | null = null;
    let advancedSlot: "team1_id" | "team2_id" | null = null;

    // The Championship has no next game.
    if (game.round < 6) {
      if (!game.winner_to_game_id) {
        return NextResponse.json(
          {
            error:
              "This game has no configured next-round destination. Initialize or repair the tournament advancement tree first.",
          },
          { status: 409 }
        );
      }

      const { data: targetGame, error: targetError } = await supabase
        .from("tournament_games")
        .select("id, round, team1_id, team2_id, winner")
        .eq("id", game.winner_to_game_id)
        .is("bracket_id", null)
        .maybeSingle();

      if (targetError) throw targetError;

      if (!targetGame || targetGame.round !== game.round + 1) {
        return NextResponse.json(
          {
            error:
              "The configured destination is not the next tournament round.",
          },
          { status: 409 }
        );
      }

      if (game.round === 0) {
        // Opening Round winners always enter Team 2 in the Round of 64.
        advancedSlot = "team2_id";

        const placeholder = `opening-${game.id}`;
        const slotValue = targetGame.team2_id;

        if (
          !targetGame.team1_id ||
          (
            slotValue !== null &&
            slotValue !== placeholder &&
            slotValue !== game.winner &&
            slotValue !== winnerTeamId
          )
        ) {
          return NextResponse.json(
            {
              error:
                "The Round-of-64 destination does not contain the expected Opening Round placeholder or this game's previous winner in Team 2.",
            },
            { status: 409 }
          );
        }
      } else {
        // Later-round games are paired into destination Team 1 and Team 2
        // according to the ordered feeder games linked to that destination.
        const { data: feederGames, error: feederError } = await supabase
          .from("tournament_games")
          .select("id, game_number")
          .eq("round", game.round)
          .eq("winner_to_game_id", targetGame.id)
          .is("bracket_id", null)
          .order("game_number", { ascending: true })
          .order("id", { ascending: true });

        if (feederError) throw feederError;

        if (!feederGames || feederGames.length !== 2) {
          return NextResponse.json(
            {
              error:
                "The destination game must have exactly two configured feeder games before a winner can advance.",
            },
            { status: 409 }
          );
        }

        const feederIndex = feederGames.findIndex(
          (feeder) => feeder.id === game.id
        );

        if (feederIndex === -1) {
          return NextResponse.json(
            {
              error:
                "This game is not registered as a feeder for its configured destination.",
            },
            { status: 409 }
          );
        }

        advancedSlot =
          feederIndex === 0 ? "team1_id" : "team2_id";

        const slotValue = targetGame[advancedSlot];

        if (
          slotValue !== null &&
          slotValue !== game.winner &&
          slotValue !== winnerTeamId
        ) {
          return NextResponse.json(
            {
              error:
                "The destination slot is occupied by a different team. Review the bracket configuration before advancing this winner.",
            },
            { status: 409 }
          );
        }
      }

      // Do not change an earlier winner after the destination game
      // has already been decided.
      if (
        targetGame.winner &&
        winnerTeamId !== game.winner
      ) {
        return NextResponse.json(
          {
            error:
              "The next-round game already has an official result. Reset that downstream result before changing this game's winner.",
          },
          { status: 409 }
        );
      }

      // Advance the team into its reserved destination slot.
      const { error: advanceError } = await supabase
        .from("tournament_games")
        .update({ [advancedSlot]: winnerTeamId })
        .eq("id", targetGame.id)
        .is("bracket_id", null);

      if (advanceError) throw advanceError;

      advancedToGameId = targetGame.id;
    }

    // Save the final scores and official winner.
    const { error: saveError } = await supabase
      .from("tournament_games")
      .update({
        home_score: team1Score,
        away_score: team2Score,
        winner: winnerTeamId,
        completed: true,
        status: "final",
      })
      .eq("id", game.id)
      .is("bracket_id", null);

    if (saveError) throw saveError;

    return NextResponse.json({
      success: true,
      game_id: game.id,
      winner_team_id: winnerTeamId,
      team1_score: team1Score,
      team2_score: team2Score,
      advanced_to_game_id: advancedToGameId,
      advanced_slot: advancedSlot,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to save tournament result.";

    console.error("Tournament result update error:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}