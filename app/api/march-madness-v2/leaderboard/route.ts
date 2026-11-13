
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// The upcoming tournament is the 2027 season.
const CURRENT_SEASON_YEAR = 2027;

const ROUND_POINTS: Record<number, number> = {
  0: 1,
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
  6: 32,
};

const OPENING_ROUND_SEED_BONUS = 14;

type OfficialGame = {
  id: string | number;
  round: number;
  team1_id: string | null;
  team2_id: string | null;
  winner: string | null;
  winner_to_game_id: string | number | null;
};

// Determines which teams can still win each official game.
// This follows the actual tournament tree, including Opening Round
// placeholders and winner_to_game_id advancement.
function buildPossibleWinnersByGame(games: OfficialGame[]) {
  const gamesById = new Map(
    games.map((game) => [String(game.id), game])
  );

  const feedersByGame = new Map<string, OfficialGame[]>();

  for (const game of games) {
    if (game.winner_to_game_id === null) continue;

    const destinationId = String(game.winner_to_game_id);
    const feeders = feedersByGame.get(destinationId) ?? [];

    feeders.push(game);
    feedersByGame.set(destinationId, feeders);
  }

  const cache = new Map<string, Set<string>>();

  function getPossibleWinners(
    gameId: string,
    visiting = new Set<string>()
  ): Set<string> {
    const game = gamesById.get(gameId);

    if (!game) return new Set();

    // A completed game can only be won by its official winner.
    if (game.winner) {
      return new Set([String(game.winner)]);
    }

    const cached = cache.get(gameId);

    if (cached) return new Set(cached);

    // Prevent accidental circular references.
    if (visiting.has(gameId)) return new Set();

    const nextVisiting = new Set(visiting);
    nextVisiting.add(gameId);

    const possible = new Set<string>();

    function addTeamOrOpeningWinner(teamId: string | null) {
      if (!teamId) return;

      // Opening Round placeholders look like opening-123.
      if (teamId.startsWith("opening-")) {
        const openingGameId = teamId.slice("opening-".length);

        const openingWinners = getPossibleWinners(
          openingGameId,
          nextVisiting
        );

        for (const id of openingWinners) {
          possible.add(id);
        }

        return;
      }

      possible.add(teamId);
    }

    addTeamOrOpeningWinner(game.team1_id);
    addTeamOrOpeningWinner(game.team2_id);

    // Include winners that can advance into this game.
    const feeders = feedersByGame.get(gameId) ?? [];

    for (const feeder of feeders) {
      const feederWinners = getPossibleWinners(
        String(feeder.id),
        nextVisiting
      );

      for (const id of feederWinners) {
        possible.add(id);
      }
    }

    cache.set(gameId, new Set(possible));

    return possible;
  }

  for (const game of games) {
    getPossibleWinners(String(game.id));
  }

  return cache;
}

// --------------------------------------------------
// HISTORICAL LEADERBOARD
// --------------------------------------------------
// Historical seasons are retrieved from the archive.
// They are never recalculated using the current tournament.

async function getHistoricalLeaderboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  seasonYear: number
) {
  const { data: archivedRows, error: archiveError } = await supabase
    .from("historical_leaderboard")
    .select("*")
    .eq("season_year", seasonYear)
    .order("finishing_rank", { ascending: true });

  if (archiveError) {
    console.error("HISTORICAL LEADERBOARD ERROR:", archiveError);

    return NextResponse.json(
      { success: false, error: archiveError.message },
      { status: 500 }
    );
  }

  const leaderboard = (archivedRows ?? []).map((row) => {
    const sourceData =
      row.source_data &&
      typeof row.source_data === "object" &&
      !Array.isArray(row.source_data)
        ? row.source_data
        : {};

    const sourceUserId =
      row.source_user_id !== null &&
      row.source_user_id !== undefined
        ? Number(row.source_user_id)
        : null;

    return {
      // A historical entry may not have an original bracket ID.
      // Give it a stable display identifier instead.
      bracket_id:
        row.source_bracket_id ??
        `historical-${row.id}`,

      user_id:
        sourceUserId !== null && Number.isFinite(sourceUserId)
          ? sourceUserId
          : null,

      bracket_name: row.bracket_name ?? null,

      display_name:
        row.player_name ?? "Unknown",

      avatar_url:
        row.avatar_url ??
        sourceData.avatar_url ??
        null,

      has_paid:
        typeof row.has_paid === "boolean"
          ? row.has_paid
          : null,

      // Historical shame voting is not recalculated.
      shame_count: 0,
      you_shamed: false,

      champion_pick: row.champion_pick ?? null,
      champion_logo_url: row.champion_logo_url ?? null,

      total_points: row.total_points ?? null,
      max_possible_points: row.max_possible_points ?? null,

      rank: row.finishing_rank,

      // Historical entries are archived records, not live pending scores.
      scoring_status: "scored",

      created_at: row.archived_at ?? row.created_at,

      // Additional historical information.
      payout_amount: row.payout_amount ?? null,
      previous_points: row.previous_points ?? null,
      previous_rank: row.previous_rank ?? null,
    };
  });

  return NextResponse.json(
    {
      success: true,
      seasonYear,
      isHistorical: true,
      leaderboard,

      // Historical champion-pick breakdowns are not currently archived.
      topChampionPicks: [],

      // Keep the HUB from attempting to display live champion-pick data.
      championPicksLocked: true,

      lockTime: null,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const searchParams = new URL(request.url).searchParams;

    const viewerUserId = searchParams.get("viewer_user_id");
    const requestedYear = searchParams.get("season_year");

    // --------------------------------------------------
    // 0. DETERMINE WHICH SEASON TO DISPLAY
    // --------------------------------------------------

    let seasonYear = CURRENT_SEASON_YEAR;

    if (requestedYear !== null) {
      seasonYear = Number(requestedYear);

      if (
        !Number.isInteger(seasonYear) ||
        seasonYear < 2000 ||
        seasonYear > 2100
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid season_year.",
          },
          { status: 400 }
        );
      }
    }

    // Historical years use the archive and bypass all live calculations.
    if (seasonYear !== CURRENT_SEASON_YEAR) {
      return await getHistoricalLeaderboard(
        supabase,
        seasonYear
      );
    }

    // --------------------------------------------------
    // 1. GET TOURNAMENT LOCK TIME
    // --------------------------------------------------

    const { data: settings, error: settingsError } = await supabase
      .from("tournament_settings")
      .select("id, lock_time")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error("TOURNAMENT SETTINGS ERROR:", settingsError);

      return NextResponse.json(
        { success: false, error: settingsError.message },
        { status: 500 }
      );
    }

    const lockTime = settings?.lock_time ?? null;

    const isLocked =
      !!lockTime &&
      Date.now() >= new Date(lockTime).getTime();

    // --------------------------------------------------
    // 2. GET MARCH MADNESS BRACKETS
    // --------------------------------------------------

    const { data: brackets, error: bracketsError } = await supabase
      .from("brackets")
      .select(
        "bracket_id, user_id, user_name, bracket_name, icon, created_at"
      )
      .eq("sport", "ncaab")
      .order("created_at", { ascending: true });

    if (bracketsError) {
      console.error("BRACKETS QUERY ERROR:", bracketsError);

      return NextResponse.json(
        { success: false, error: bracketsError.message },
        { status: 500 }
      );
    }

    if (!brackets || brackets.length === 0) {
      return NextResponse.json(
        {
          success: true,
          seasonYear: CURRENT_SEASON_YEAR,
          isHistorical: false,
          leaderboard: [],
          topChampionPicks: [],
          championPicksLocked: !isLocked,
          lockTime,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const bracketIds = brackets.map((bracket) => bracket.bracket_id);

    // --------------------------------------------------
    // 3. GET PLAYER PAYMENT STATUS
    // --------------------------------------------------

    const userIds = [
      ...new Set(
        brackets
          .map((bracket) => bracket.user_id)
          .filter(
            (id): id is number =>
              id !== null && id !== undefined
          )
      ),
    ];

    const paidByUser = new Map<string, boolean | null>();

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("user_id, has_paid")
        .in("user_id", userIds);

      if (usersError) {
        console.error("PLAYER PAYMENT STATUS ERROR:", usersError);

        return NextResponse.json(
          { success: false, error: usersError.message },
          { status: 500 }
        );
      }

      for (const user of users ?? []) {
        paidByUser.set(
          String(user.user_id),
          typeof user.has_paid === "boolean"
            ? user.has_paid
            : null
        );
      }
    }

    // --------------------------------------------------
    // 4. GET SHAME VOTES
    // --------------------------------------------------

    const shameCountByUser = new Map<string, number>();
    const targetsShamedByViewer = new Set<string>();

    if (userIds.length > 0) {
      const { data: shameVotes, error: shameError } = await supabase
        .from("march_madness_shames")
        .select("voter_user_id, target_user_id")
        .in("target_user_id", userIds);

      if (shameError) {
        console.error("SHAME VOTES QUERY ERROR:", shameError);

        return NextResponse.json(
          { success: false, error: shameError.message },
          { status: 500 }
        );
      }

      for (const vote of shameVotes ?? []) {
        const targetId = String(vote.target_user_id);

        shameCountByUser.set(
          targetId,
          (shameCountByUser.get(targetId) ?? 0) + 1
        );

        if (
          viewerUserId &&
          String(vote.voter_user_id) === String(viewerUserId)
        ) {
          targetsShamedByViewer.add(targetId);
        }
      }
    }

    // --------------------------------------------------
    // 5. GET LEADERBOARD SCORING
    // --------------------------------------------------

    const { data: scores, error: scoresError } = await supabase
      .from("bracket_leaderboard")
      .select(
        "bracket_id, total_points, rank, previous_points, previous_rank, name, avatar_url"
      )
      .in("bracket_id", bracketIds);

    if (scoresError) {
      console.error("LEADERBOARD SCORES ERROR:", scoresError);

      return NextResponse.json(
        { success: false, error: scoresError.message },
        { status: 500 }
      );
    }

    const scoreByBracket = new Map(
      (scores ?? []).map((score) => [
        score.bracket_id,
        score,
      ])
    );

    // --------------------------------------------------
    // 6. CALCULATE MAXIMUM POSSIBLE POINTS
    // --------------------------------------------------

    // Load the official tournament tree.
    const { data: officialGames, error: gamesError } = await supabase
      .from("tournament_games")
      .select(
        "id, round, team1_id, team2_id, winner, winner_to_game_id"
      )
      .is("bracket_id", null)
      .order("round", { ascending: true })
      .order("game_number", { ascending: true });

    if (gamesError) {
      console.error("MAX POSSIBLE GAMES ERROR:", gamesError);

      return NextResponse.json(
        { success: false, error: gamesError.message },
        { status: 500 }
      );
    }

    const games = (officialGames ?? []) as OfficialGame[];

    // Load team seeds for the regular seed bonus.
    const { data: teams, error: teamsError } = await supabase
      .from("tournament_teams")
      .select("id, seed");

    if (teamsError) {
      console.error("MAX POSSIBLE TEAMS ERROR:", teamsError);

      return NextResponse.json(
        { success: false, error: teamsError.message },
        { status: 500 }
      );
    }

    const seedByTeam = new Map<string, number>();

    for (const team of teams ?? []) {
      const seed = Number(team.seed);

      if (Number.isInteger(seed) && seed >= 1) {
        seedByTeam.set(String(team.id), seed);
      }
    }

    // Identify teams that actually participated in the Opening Round.
    const openingRoundTeamIds = new Set<string>();

    for (const game of games) {
      if (Number(game.round) !== 0) continue;

      if (
        game.team1_id &&
        !game.team1_id.startsWith("opening-")
      ) {
        openingRoundTeamIds.add(String(game.team1_id));
      }

      if (
        game.team2_id &&
        !game.team2_id.startsWith("opening-")
      ) {
        openingRoundTeamIds.add(String(game.team2_id));
      }
    }

    // Determine which teams can still win each official game.
    const possibleWinnersByGame = buildPossibleWinnersByGame(games);

    // Load all bracket selections.
    const { data: allPicks, error: picksError } = await supabase
      .from("bracket_picks")
      .select("bracket_id, game_id, picked_team")
      .in("bracket_id", bracketIds);

    if (picksError) {
      console.error("MAX POSSIBLE PICKS ERROR:", picksError);

      return NextResponse.json(
        { success: false, error: picksError.message },
        { status: 500 }
      );
    }

    const gameById = new Map(
      games.map((game) => [String(game.id), game])
    );

    // Start at zero and calculate earned + still-possible points
    // directly from official results and each bracket's picks.
    // This avoids depending on a potentially stale leaderboard score.
    const maxPossibleByBracket = new Map<string, number>(
      bracketIds.map((id) => [String(id), 0])
    );

    for (const pick of allPicks ?? []) {
      const bracketId = String(pick.bracket_id);
      const game = gameById.get(String(pick.game_id));

      const pickedTeam = pick.picked_team
        ? String(pick.picked_team)
        : null;

      if (!game || !pickedTeam) continue;

      const round = Number(game.round);
      const basePoints = ROUND_POINTS[round];

      if (basePoints === undefined) continue;

      // Apply the exact same bonus rules as the canonical scorer.
      const bonusPoints =
        round === 0
          ? 0
          : openingRoundTeamIds.has(pickedTeam)
            ? OPENING_ROUND_SEED_BONUS
            : seedByTeam.get(pickedTeam) ?? 0;

      // COMPLETED GAME:
      // Only a correct selection earns points.
      if (game.winner) {
        if (pickedTeam !== String(game.winner)) continue;

        maxPossibleByBracket.set(
          bracketId,
          (maxPossibleByBracket.get(bracketId) ?? 0) +
            basePoints +
            bonusPoints
        );

        continue;
      }

      // UNFINISHED GAME:
      // The selected team must still be capable of reaching this game.
      const possibleWinners =
        possibleWinnersByGame.get(String(game.id));

      if (!possibleWinners?.has(pickedTeam)) continue;

      // Add the points this bracket could still earn in this game.
      maxPossibleByBracket.set(
        bracketId,
        (maxPossibleByBracket.get(bracketId) ?? 0) +
          basePoints +
          bonusPoints
      );
    }

    // --------------------------------------------------
    // 7. CHAMPION PICKS
    // --------------------------------------------------
    // Do not retrieve championship picks or team names
    // until tournament_settings.lock_time has passed.

    const championPickByBracket = new Map<string, string>();
    const teamNameById = new Map<string, string>();
    const teamLogoById = new Map<string, string | null>();

    let topChampionPicks: {
      team_id: string;
      team_name: string;
      logo_url: string | null;
      count: number;
      percentage: number;
    }[] = [];

    if (isLocked) {
      const { data: championshipGames, error: championshipError } =
        await supabase
          .from("tournament_games")
          .select("id")
          .eq("round", 6)
          .is("bracket_id", null)
          .limit(1);

      if (championshipError) {
        console.error(
          "CHAMPIONSHIP GAME ERROR:",
          championshipError
        );

        return NextResponse.json(
          { success: false, error: championshipError.message },
          { status: 500 }
        );
      }

      const championshipGameId = championshipGames?.[0]?.id;

      if (championshipGameId) {
        const { data: picks, error: picksError } = await supabase
          .from("bracket_picks")
          .select("bracket_id, picked_team, winner_team_id")
          .in("bracket_id", bracketIds)
          .eq("game_id", championshipGameId);

        if (picksError) {
          console.error("CHAMPION PICKS ERROR:", picksError);

          return NextResponse.json(
            { success: false, error: picksError.message },
            { status: 500 }
          );
        }

        const validPicks = (picks ?? [])
          .map((pick) => ({
            bracket_id: pick.bracket_id,
            team_id: pick.picked_team || pick.winner_team_id,
          }))
          .filter(
            (
              pick
            ): pick is {
              bracket_id: string;
              team_id: string;
            } => !!pick.team_id
          );

        for (const pick of validPicks) {
          championPickByBracket.set(
            pick.bracket_id,
            pick.team_id
          );
        }

        const counts = new Map<string, number>();

        for (const pick of validPicks) {
          counts.set(
            pick.team_id,
            (counts.get(pick.team_id) ?? 0) + 1
          );
        }

        const teamIds = [...counts.keys()];

        if (teamIds.length > 0) {
          const { data: championTeams, error: championTeamsError } =
            await supabase
              .from("tournament_teams")
              .select("id, team_name, logo_url")
              .in("id", teamIds);

          if (championTeamsError) {
            console.error(
              "CHAMPION TEAM NAMES ERROR:",
              championTeamsError
            );

            return NextResponse.json(
              { success: false, error: championTeamsError.message },
              { status: 500 }
            );
          }

          for (const team of championTeams ?? []) {
            teamNameById.set(team.id, team.team_name);
            teamLogoById.set(team.id, team.logo_url ?? null);
          }

          const totalPicks = validPicks.length;

          topChampionPicks = [...counts.entries()]
            .map(([teamId, count]) => ({
              team_id: teamId,
              team_name: teamNameById.get(teamId) ?? "Unknown Team",
              logo_url: teamLogoById.get(teamId) ?? null,
              count,
              percentage:
                totalPicks > 0
                  ? Math.round((count / totalPicks) * 100)
                  : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }
      }
    }

    // --------------------------------------------------
    // 8. BUILD LEADERBOARD
    // --------------------------------------------------

    const leaderboard = brackets
      .map((bracket) => {
        const score = scoreByBracket.get(bracket.bracket_id);

        const championTeamId = isLocked
          ? championPickByBracket.get(bracket.bracket_id)
          : undefined;

        const championTeamName = championTeamId
          ? teamNameById.get(championTeamId) ?? null
          : null;

        const playerId =
          bracket.user_id === null ||
          bracket.user_id === undefined
            ? null
            : String(bracket.user_id);

        return {
          bracket_id: bracket.bracket_id,
          user_id: bracket.user_id,
          bracket_name: bracket.bracket_name,
          display_name:
            bracket.user_name || score?.name || "Unknown",
          avatar_url: score?.avatar_url ?? null,

          // Payment status
          has_paid:
            playerId === null
              ? null
              : paidByUser.get(playerId) ?? null,

          // Shame totals and whether the current viewer has voted
          shame_count:
            playerId === null
              ? 0
              : shameCountByUser.get(playerId) ?? 0,

          you_shamed:
            playerId === null
              ? false
              : targetsShamedByViewer.has(playerId),

          // Champion selections remain hidden before lock.
          champion_pick: isLocked
            ? championTeamName
            : null,

          // Champion logo is returned only after the tournament lock.
          champion_logo_url: championTeamId
            ? teamLogoById.get(championTeamId) ?? null
            : null,

          total_points: score?.total_points ?? null,

          // Current score plus all remaining points still possible.
          max_possible_points:
            maxPossibleByBracket.get(String(bracket.bracket_id)) ?? 0,

          rank: score?.rank ?? null,
          scoring_status: score ? "scored" : "pending",
          created_at: bracket.created_at,
        };
      })
      .sort((a, b) => {
        if (a.scoring_status !== b.scoring_status) {
          return a.scoring_status === "scored" ? -1 : 1;
        }

        if (a.scoring_status === "scored") {
          return (
            (b.total_points ?? 0) -
            (a.total_points ?? 0)
          );
        }

        return (
          new Date(a.created_at ?? 0).getTime() -
          new Date(b.created_at ?? 0).getTime()
        );
      });

    // --------------------------------------------------
    // 9. RETURN RESULTS
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        seasonYear: CURRENT_SEASON_YEAR,
        isHistorical: false,
        leaderboard,
        topChampionPicks: isLocked
          ? topChampionPicks
          : [],
        championPicksLocked: !isLocked,
        lockTime,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: unknown) {
    console.error("LEADERBOARD ROUTE ERROR:", err);

    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
