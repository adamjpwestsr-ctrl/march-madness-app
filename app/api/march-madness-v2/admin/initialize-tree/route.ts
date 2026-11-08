
import { NextResponse } from "next/server";
import { requireMarchMadnessAdmin } from "@/lib/march-madness-v2/requireAdmin";

type OfficialGame = {
  id: string;
  round: number;
  game_number: number;
  region: string | null;
  team1_id: string | null;
  team2_id: string | null;
  winner_to_game_id: string | null;
};

const REGIONS = ["East", "Midwest", "South", "West"] as const;

const EXPECTED: Record<number, number> = {
  0: 12,
  1: 32,
  2: 16,
  3: 8,
  4: 4,
  5: 2,
  6: 1,
};

function gameKey(
  round: number,
  region: string | null,
  gameNumber: number
) {
  return `${round}|${region ?? "_"}|${gameNumber}`;
}

function expectedSlots() {
  const slots: Array<{
    round: number;
    game_number: number;
    region: string | null;
  }> = [];

  for (const region of REGIONS) {
    for (let i = 1; i <= 4; i++) {
      slots.push({
        round: 2,
        game_number: 200 + i,
        region,
      });
    }

    for (let i = 1; i <= 2; i++) {
      slots.push({
        round: 3,
        game_number: 300 + i,
        region,
      });
    }

    slots.push({
      round: 4,
      game_number: 401,
      region,
    });
  }

  slots.push(
    { round: 5, game_number: 501, region: null },
    { round: 5, game_number: 502, region: null },
    { round: 6, game_number: 600, region: null }
  );

  return slots;
}

export async function POST() {
  const auth = await requireMarchMadnessAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const { supabase } = auth;

  try {
    // Load the existing shared official tournament tree.
    const { data: initial, error: loadError } = await supabase
      .from("tournament_games")
      .select(
        "id, round, game_number, region, team1_id, team2_id, winner_to_game_id"
      )
      .is("bracket_id", null);

    if (loadError) throw loadError;

    const current = (initial ?? []) as OfficialGame[];

    const counts = new Map<number, number>();

    for (const game of current) {
      counts.set(
        game.round,
        (counts.get(game.round) ?? 0) + 1
      );
    }

    // The first two rounds must already exist.
    if (
      counts.get(0) !== EXPECTED[0] ||
      counts.get(1) !== EXPECTED[1]
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Save all 12 Opening Round games and all 32 Round-of-64 games first.",
          actual: Object.fromEntries(counts),
        },
        { status: 409 }
      );
    }

    const openingGames = current.filter(
      (game) => game.round === 0
    );

    const round64 = current.filter(
      (game) => game.round === 1
    );

    // Verify the Round of 64 has exactly 8 games in each region.
    for (const region of REGIONS) {
      const regionGames = round64.filter(
        (game) => game.region === region
      );

      if (regionGames.length !== 8) {
        return NextResponse.json(
          {
            success: false,
            error: `Round of 64 must have exactly 8 games in ${region}; found ${regionGames.length}.`,
          },
          { status: 409 }
        );
      }
    }

    // IMPORTANT:
    // The saved Round-of-64 Team 2 placeholder is the source
    // of truth for each Opening Round destination.
    //
    // Do not require winner_to_game_id to already be populated.
    // This API repairs that link using the saved placeholder.
    const openingDestinationLinks = new Map<string, string>();
    const assignedDestinations = new Set<string>();

    for (const openingGame of openingGames) {
      const placeholder = `opening-${openingGame.id}`;

      const matchingDestinations = round64.filter(
        (game) => game.team2_id === placeholder
      );

      if (matchingDestinations.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Opening Round Game ${openingGame.game_number} does not have a matching Team 2 placeholder in any Round of 64 game. ` +
              "Return to the Full Bracket Editor, select its Winner placeholder in Team 2, and save that region.",
          },
          { status: 409 }
        );
      }

      if (matchingDestinations.length > 1) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Opening Round Game ${openingGame.game_number} is assigned to more than one Round of 64 game. Please correct the duplicate Team 2 assignments.`,
          },
          { status: 409 }
        );
      }

      const destination = matchingDestinations[0];

      if (assignedDestinations.has(destination.id)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "More than one Opening Round game is assigned to the same Round of 64 destination.",
          },
          { status: 409 }
        );
      }

      assignedDestinations.add(destination.id);

      // Store the actual database IDs, not game numbers.
      openingDestinationLinks.set(
        openingGame.id,
        destination.id
      );
    }

    // Create only missing downstream slots.
    const existingKeys = new Set(
      current.map((game) =>
        gameKey(game.round, game.region, game.game_number)
      )
    );

    const missing = expectedSlots().filter(
      (slot) =>
        !existingKeys.has(
          gameKey(slot.round, slot.region, slot.game_number)
        )
    );

    let insertedCount = 0;

    if (missing.length > 0) {
      const payload = missing.map((slot) => ({
        id: crypto.randomUUID(),
        round: slot.round,
        game_number: slot.game_number,
        region: slot.region,
        team1_id: null,
        team2_id: null,
        home_score: 0,
        away_score: 0,
        winner: null,
        status: "pre",
        completed: false,
        is_placeholder: true,
        winner_to_game_id: null,
        bracket_id: null,
      }));

      const { error: insertError } = await supabase
        .from("tournament_games")
        .insert(payload);

      if (insertError) throw insertError;

      insertedCount = payload.length;
    }

    // Reload all shared official games after inserting missing slots.
    const { data: allData, error: reloadError } = await supabase
      .from("tournament_games")
      .select(
        "id, round, game_number, region, team1_id, team2_id, winner_to_game_id"
      )
      .is("bracket_id", null);

    if (reloadError) throw reloadError;

    const all = (allData ?? []) as OfficialGame[];

    const byRoundRegion = (
      round: number,
      region: string | null
    ) =>
      all
        .filter(
          (game) =>
            game.round === round && game.region === region
        )
        .sort((a, b) => a.game_number - b.game_number);

    const links = new Map<string, string>();

    // Add the repaired Opening Round -> Round of 64 links.
    for (const [openingGameId, destinationId] of openingDestinationLinks) {
      links.set(openingGameId, destinationId);
    }

    // Regional progression:
    // Round of 64 -> Round of 32 -> Sweet 16 -> Elite 8.
    for (const region of REGIONS) {
      for (const [fromRound, toRound] of [
        [1, 2],
        [2, 3],
        [3, 4],
      ] as const) {
        const from = byRoundRegion(fromRound, region);
        const to = byRoundRegion(toRound, region);

        const expectedFrom = EXPECTED[fromRound] / 4;
        const expectedTo = EXPECTED[toRound] / 4;

        if (
          from.length !== expectedFrom ||
          to.length !== expectedTo
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                `Cannot wire ${region} round ${fromRound}: unexpected game counts.`,
            },
            { status: 409 }
          );
        }

        from.forEach((game, index) => {
          const target = to[Math.floor(index / 2)];

          if (target) {
            links.set(game.id, target.id);
          }
        });
      }
    }

    // National semifinal pairing:
    // East vs Midwest; South vs West.
    const finalFour = byRoundRegion(5, null);

    const eastElite = byRoundRegion(4, "East")[0];
    const midwestElite = byRoundRegion(4, "Midwest")[0];
    const southElite = byRoundRegion(4, "South")[0];
    const westElite = byRoundRegion(4, "West")[0];

    if (
      finalFour.length !== 2 ||
      !eastElite ||
      !midwestElite ||
      !southElite ||
      !westElite
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot wire Final Four: regional Elite 8 or Final Four game slots are missing.",
        },
        { status: 409 }
      );
    }

    links.set(eastElite.id, finalFour[0].id);
    links.set(midwestElite.id, finalFour[0].id);
    links.set(southElite.id, finalFour[1].id);
    links.set(westElite.id, finalFour[1].id);

    const championship = byRoundRegion(6, null)[0];

    if (!championship) {
      return NextResponse.json(
        {
          success: false,
          error: "Championship game slot is missing.",
        },
        { status: 409 }
      );
    }

    finalFour.forEach((game) => {
      links.set(game.id, championship.id);
    });

    // Update only winner destination links.
    // Existing matchups, scores, results, and status remain untouched.
    let linksUpdated = 0;

    for (const [gameId, destinationId] of links) {
      const existingGame = all.find(
        (game) => game.id === gameId
      );

      if (
        existingGame?.winner_to_game_id === destinationId
      ) {
        continue;
      }

      const { error: updateError } = await supabase
        .from("tournament_games")
        .update({
          winner_to_game_id: destinationId,
        })
        .eq("id", gameId)
        .is("bracket_id", null);

      if (updateError) throw updateError;

      linksUpdated++;
    }

    // Verify the final official tree.
    const { data: finalData, error: finalError } = await supabase
      .from("tournament_games")
      .select("round, winner_to_game_id")
      .is("bracket_id", null);

    if (finalError) throw finalError;

    const finalCounts = new Map<number, number>();

    for (const game of finalData ?? []) {
      finalCounts.set(
        game.round,
        (finalCounts.get(game.round) ?? 0) + 1
      );
    }

    const countSummary = Object.fromEntries(finalCounts);
    const total = finalData?.length ?? 0;

    const missingCounts = Object.entries(EXPECTED).filter(
      ([round, expectedCount]) =>
        finalCounts.get(Number(round)) !== expectedCount
    );

    if (total !== 75 || missingCounts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          insertedCount,
          linksUpdated,
          actual: countSummary,
          actualTotal: total,
          error:
            "Tree initialization ran, but final round counts do not match the expected 75 games.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      insertedCount,
      linksUpdated,
      actual: countSummary,
      actualTotal: total,
      note:
        "Existing games and teams were preserved. Opening Round destinations were repaired from the saved Round-of-64 Team 2 placeholders. Later-round slots were left unassigned; winner destinations were linked.",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to initialize the shared tournament tree.";

    console.error(
      "Initialize March Madness tree error:",
      message
    );

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
