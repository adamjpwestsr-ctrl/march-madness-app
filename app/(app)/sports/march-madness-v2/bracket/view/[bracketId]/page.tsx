
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type Game = {
  id: string;
  game_number: number;
  round: number;
  region: string | null;
  team1_id: string | null;
  team2_id: string | null;
  winner_to_game_id: string | null;
  winner: string | null;
  status: string | null;
  completed: boolean | null;
  home_score: number | null;
  away_score: number | null;
};

type Team = {
  id: string;
  team_name: string;
  seed: number | null;
  region: string | null;
};

type BracketPick = {
  game_id: string;
  picked_team: string | null;
  winner_team_id?: string | null;
};

type SlotRange = {
  start: number;
  end: number;
};

const REGIONS = ["West", "East", "South", "Midwest"];
const REGION_GRID_HEIGHT = 832;

export default async function PrettyBracketViewPage({
  params,
}: {
  params: Promise<{ bracketId: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { bracketId } = await params;

  const { data: bracket, error: bracketErr } = await supabase
    .from("brackets")
    .select("*")
    .eq("bracket_id", bracketId)
    .single();

  if (bracketErr || !bracket) {
    console.error("Bracket lookup failed:", bracketErr?.message);

    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Bracket not found</h1>
          <p className="mt-3 text-slate-400">
            We couldn't find this bracket. It may have been removed or the
            link may be incorrect.
          </p>
          <Link
            href="/sports/march-madness-v2/bracket/my"
            className="mt-6 inline-flex rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400"
          >
            Return to My Brackets
          </Link>
        </div>
      </main>
    );
  }

  const { data: rawGames, error: gamesErr } = await supabase
    .from("tournament_games")
    .select(
      "id, game_number, round, region, team1_id, team2_id, winner_to_game_id, winner, status, completed, home_score, away_score"
    )
    .is("bracket_id", null)
    .order("round", { ascending: true })
    .order("game_number", { ascending: true });

  const { data: rawTeams, error: teamsErr } = await supabase
    .from("tournament_teams")
    .select("id, team_name, seed, region");

  const { data: rawPicks, error: picksErr } = await supabase
    .from("bracket_picks")
    .select("game_id, picked_team, winner_team_id")
    .eq("bracket_id", bracketId);

  if (gamesErr || teamsErr || picksErr) {
    console.error("Bracket view data error:", {
      games: gamesErr?.message,
      teams: teamsErr?.message,
      picks: picksErr?.message,
    });

    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-500/30 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">
            Unable to load your bracket
          </h1>
          <p className="mt-3 text-slate-400">
            Your bracket may have saved, but we couldn't load all of its
            details. Please try refreshing this page.
          </p>
          <Link
            href={`/sports/march-madness-v2/bracket/edit/${bracketId}`}
            className="mt-6 inline-flex rounded-lg bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300"
          >
            Return to Bracket Editor
          </Link>
        </div>
      </main>
    );
  }

  const games = (rawGames ?? []) as Game[];
  const teams = (rawTeams ?? []) as Team[];
  const picks = (rawPicks ?? []) as BracketPick[];

  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const gameMap = new Map(games.map((game) => [game.id, game]));

  // Preserve the user's original saved selections.
  const pickMap: Record<string, string> = {};

  for (const pick of picks) {
    const selectedTeam = pick.picked_team || pick.winner_team_id;

    if (selectedTeam && teamMap.has(selectedTeam)) {
      pickMap[pick.game_id] = selectedTeam;
    }
  }

  // Build a separate projected tree for this user's picks.
  // Official tournament results are never written into this tree.
  const projectedGames = new Map<string, Game>(
    games.map((game) => [game.id, { ...game }])
  );

  const incomingGames = new Map<string, Game[]>();

  for (const game of games) {
    if (!game.winner_to_game_id) continue;

    const existing = incomingGames.get(game.winner_to_game_id) ?? [];
    existing.push(game);
    incomingGames.set(game.winner_to_game_id, existing);
  }

  for (const feeders of incomingGames.values()) {
    feeders.sort(
      (a, b) =>
        a.game_number - b.game_number || a.id.localeCompare(b.id)
    );
  }

  function getActualTeamId(
    teamId: string | null | undefined
  ): string | null {
    if (!teamId) return null;

    if (teamId.startsWith("opening-")) {
      const openingGameId = teamId.slice("opening-".length);
      return pickMap[openingGameId] ?? null;
    }

    return teamMap.has(teamId) ? teamId : null;
  }

  // Advance the user's selections through their projected bracket.
  for (let round = 0; round <= 6; round++) {
    const roundGames = games.filter((game) => game.round === round);

    for (const originalGame of roundGames) {
      const game = projectedGames.get(originalGame.id);
      if (!game) continue;

      game.team1_id = getActualTeamId(game.team1_id);
      game.team2_id = getActualTeamId(game.team2_id);

      const winnerId = pickMap[game.id];

      if (
        !winnerId ||
        (winnerId !== game.team1_id && winnerId !== game.team2_id) ||
        !game.winner_to_game_id
      ) {
        continue;
      }

      const destination = projectedGames.get(game.winner_to_game_id);
      if (!destination) continue;

      // Opening Round winners enter Team 2 in the Round of 64.
      if (round === 0) {
        destination.team2_id = winnerId;
        continue;
      }

      const feeders = incomingGames.get(destination.id) ?? [];
      const feederIndex = feeders.findIndex(
        (feeder) => feeder.id === game.id
      );

      if (feederIndex === 0) {
        destination.team1_id = winnerId;
      } else if (feederIndex === 1) {
        destination.team2_id = winnerId;
      }
    }
  }

  function getTeam(teamId: string | null | undefined): Team | undefined {
    if (!teamId) return undefined;
    return teamMap.get(teamId);
  }

  function getEntrantLabel(teamId: string | null): string {
    if (!teamId) return "TBD";

    if (teamId.startsWith("opening-")) {
      const openingGameId = teamId.slice("opening-".length);
      const openingGame = gameMap.get(openingGameId);

      if (!openingGame) return "Opening Round winner";

      const first = getTeam(openingGame.team1_id);
      const second = getTeam(openingGame.team2_id);

      if (first && second) {
        return `Winner: ${first.team_name} / ${second.team_name}`;
      }

      return "Opening Round winner";
    }

    return getTeam(teamId)?.team_name ?? "TBD";
  }

  function getProjectedGame(game: Game): Game {
    return projectedGames.get(game.id) ?? game;
  }

  function getValidWinner(game: Game): Team | undefined {
    const projected = getProjectedGame(game);
    const winnerId = pickMap[game.id];

    if (
      !winnerId ||
      (winnerId !== projected.team1_id &&
        winnerId !== projected.team2_id)
    ) {
      return undefined;
    }

    return getTeam(winnerId);
  }

  // Determine whether a displayed team was the user's original Opening
  // Round pick and lost that game.
  function isEliminatedOpeningPick(
    gameId: string,
    originalSlotId: string | null,
    displayedTeamId: string | null
  ): boolean {
    if (!gameId || !displayedTeamId) return false;

    const possibleOpeningGames = new Map<string, Game>();

    // Find Opening Round games that feed this matchup.
    const feeders = incomingGames.get(gameId) ?? [];

    for (const feeder of feeders) {
      if (feeder.round === 0) {
        possibleOpeningGames.set(feeder.id, feeder);
      }
    }

    // Fallback to the original Opening Round placeholder.
    if (originalSlotId?.startsWith("opening-")) {
      const openingGameId = originalSlotId.slice("opening-".length);
      const openingGame = gameMap.get(openingGameId);

      if (openingGame) {
        possibleOpeningGames.set(openingGame.id, openingGame);
      }
    }

    for (const openingGame of possibleOpeningGames.values()) {
      const openingIsFinal =
        openingGame.completed === true ||
        openingGame.status?.toLowerCase() === "final";

      if (!openingIsFinal || !openingGame.winner) continue;

      const originalOpeningPick = pickMap[openingGame.id];

      if (
        originalOpeningPick === displayedTeamId &&
        originalOpeningPick !== openingGame.winner
      ) {
        return true;
      }
    }

    return false;
  }

  const openingGames = games
    .filter((game) => game.round === 0)
    .sort((a, b) => a.game_number - b.game_number);

  const regionGames: Record<string, Game[]> = {};

  for (const region of REGIONS) {
    regionGames[region] = games
      .filter(
        (game) =>
          game.region === region &&
          game.round >= 1 &&
          game.round <= 4
      )
      .sort(
        (a, b) =>
          a.round - b.round ||
          a.game_number - b.game_number
      );
  }

  const finalFourGames = games
    .filter((game) => game.round === 5)
    .sort((a, b) => a.game_number - b.game_number);

  const championshipGame =
    games.find((game) => game.round === 6) ?? null;

  const championTeam = championshipGame
    ? getValidWinner(championshipGame)
    : undefined;

  const totalGames = games.length;
  const completedPicks = games.filter(
    (game) => getValidWinner(game)
  ).length;
  const isComplete = totalGames > 0 && completedPicks === totalGames;

  const bracketName = bracket.bracket_name || "My March Madness Bracket";

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#070d19] px-3 py-4 text-white sm:px-5 lg:px-6">
      <div className="mx-auto min-w-0 max-w-[1900px]">
        {/* Page header */}
        <header className="mb-5 rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-[#101d33] to-[#101b30] p-4 shadow-xl sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-300">
                  Bracket Saved
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  BracketBoss Tournament Center
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">🏀</span>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-black tracking-tight sm:text-3xl">
                    {bracketName}
                  </h1>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    Your picks stay yours. Official results show what is still alive.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/sports/march-madness-v2"
                className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 sm:text-sm"
              >
                🏠 Bracket HUB
              </Link>

              <Link
                href={`/sports/march-madness-v2/bracket/edit/${bracketId}`}
                className="rounded-lg bg-yellow-400 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-yellow-300 sm:text-sm"
              >
                ✏️ Edit Bracket
              </Link>

              <Link
                href="/sports/march-madness-v2/bracket/my"
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700 sm:text-sm"
              >
                My Brackets
              </Link>
            </div>
          </div>

          {/* Bracket statistics */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-700/70 pt-4">
            <CompactStat
              label="Picks Made"
              value={`${completedPicks}/${totalGames}`}
            />
            <CompactStat label="Regions" value="4" />
            <CompactStat
              label="Status"
              value={isComplete ? "Complete" : "In Progress"}
            />
          </div>
        </header>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs">
          <span className="text-slate-500">Key</span>
          <LegendItem color="bg-green-400" label="Correct pick" />
          <LegendItem color="bg-red-400" label="Eliminated pick" />
          <LegendItem color="bg-blue-400" label="Official winner" />
          <LegendItem color="bg-slate-500" label="Pending / TBD" />
        </div>

        {/* Expandable Opening Round */}
        <details className="group mb-5 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/80">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 bg-slate-800/70 px-4 py-3 transition hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10 text-lg">
                ⚡
              </span>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider">
                  Opening Round
                </h2>
                <p className="text-[10px] text-slate-400">
                  {openingGames.length} games · Expand to view your play-in picks
                </p>
              </div>
            </div>
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-300">
              <span className="group-open:hidden">Show games</span>
              <span className="hidden group-open:inline">Hide games</span>
              <span className="transition group-open:rotate-180">⌄</span>
            </span>
          </summary>

          <div className="grid grid-cols-1 gap-3 border-t border-slate-700 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {openingGames.map((game) => (
              <GameCard
                key={game.id}
                game={getProjectedGame(game)}
                officialGame={game}
                roundLabel="Opening Round"
                selectedWinner={getValidWinner(game)}
                getTeam={getTeam}
                getEntrantLabel={getEntrantLabel}
                isEliminatedOpeningPick={isEliminatedOpeningPick}
                compact
              />
            ))}
            {openingGames.length === 0 && (
              <EmptyState message="There are no Opening Round games in this tournament tree." />
            )}
          </div>
        </details>

        {/* Main bracket */}
        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                The road to the championship
              </p>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                Tournament Bracket
              </h2>
            </div>
            <p className="text-[10px] text-slate-500">
              Click any matchup to expand its details
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_210px_minmax(0,1fr)]">
            {/* Left side: games progress toward the center */}
            <div className="min-w-0 space-y-3">
              {["West", "South"].map((region) => (
                <RegionPanel
                  key={region}
                  title={region}
                  games={regionGames[region] ?? []}
                  incomingGames={incomingGames}
                  getProjectedGame={getProjectedGame}
                  getValidWinner={getValidWinner}
                  getTeam={getTeam}
                  getEntrantLabel={getEntrantLabel}
                  isEliminatedOpeningPick={isEliminatedOpeningPick}
                  reverseRounds={false}
                />
              ))}
            </div>

            {/* Center championship column */}
            <div className="order-first min-w-0 space-y-3 xl:order-none xl:sticky xl:top-4">
              <div className="rounded-xl border border-yellow-400/30 bg-gradient-to-b from-yellow-400/10 to-slate-900 p-3 text-center shadow-lg shadow-yellow-950/10">
                <div className="text-3xl">🏆</div>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">
                  National Champion
                </p>
                <h3 className="mt-2 break-words text-lg font-black leading-tight">
                  {championTeam?.team_name ?? "Not selected"}
                </h3>
                {championTeam?.seed != null && (
                  <p className="mt-1 text-[10px] text-yellow-100/70">
                    {championTeam.seed} seed
                  </p>
                )}
                <p className="mt-2 text-[10px] text-slate-400">
                  Your championship prediction
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                  Final Four
                </p>

                <div className="space-y-3">
                  {finalFourGames.map((game, index) => (
                    <GameCard
                      key={game.id}
                      game={getProjectedGame(game)}
                      officialGame={game}
                      roundLabel={`Semifinal ${index + 1}`}
                      selectedWinner={getValidWinner(game)}
                      getTeam={getTeam}
                      getEntrantLabel={getEntrantLabel}
                      isEliminatedOpeningPick={isEliminatedOpeningPick}
                      compact
                    />
                  ))}

                  {finalFourGames.length === 0 && (
                    <EmptyState message="Final Four games have not been loaded yet." />
                  )}
                </div>
              </div>

              {championshipGame && (
                <div className="rounded-xl border border-yellow-400/30 bg-slate-900 p-3">
                  <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                    Championship Game
                  </p>
                  <GameCard
                    game={getProjectedGame(championshipGame)}
                    officialGame={championshipGame}
                    roundLabel="National Championship"
                    selectedWinner={getValidWinner(championshipGame)}
                    getTeam={getTeam}
                    getEntrantLabel={getEntrantLabel}
                    isEliminatedOpeningPick={isEliminatedOpeningPick}
                    compact
                  />
                </div>
              )}

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Bracket Progress
                </p>
                <p className="mt-1 text-center text-xl font-black tabular-nums">
                  {totalGames > 0
                    ? Math.round((completedPicks / totalGames) * 100)
                    : 0}
                  <span className="text-sm text-slate-500">%</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300"
                    style={{
                      width: `${
                        totalGames > 0
                          ? (completedPicks / totalGames) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-500">
                  {completedPicks} of {totalGames} picks made
                </p>
              </div>
            </div>

            {/* Right side: reversed so games progress toward the center */}
            <div className="min-w-0 space-y-3">
              {["East", "Midwest"].map((region) => (
                <RegionPanel
                  key={region}
                  title={region}
                  games={regionGames[region] ?? []}
                  incomingGames={incomingGames}
                  getProjectedGame={getProjectedGame}
                  getValidWinner={getValidWinner}
                  getTeam={getTeam}
                  getEntrantLabel={getEntrantLabel}
                  isEliminatedOpeningPick={isEliminatedOpeningPick}
                  reverseRounds
                />
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-6 border-t border-slate-800 py-6 text-center">
          <p className="text-xs text-slate-500">
            BracketBoss · Your picks. Your path. Your championship.
          </p>
          <Link
            href={`/sports/march-madness-v2/bracket/edit/${bracketId}`}
            className="mt-2 inline-block text-xs font-semibold text-blue-300 hover:text-blue-200"
          >
            Make changes to your bracket →
          </Link>
        </footer>
      </div>
    </main>
  );
}

function CompactStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-black text-white sm:text-base">
        {value}
      </p>
    </div>
  );
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-slate-300">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-center text-xs text-slate-400">
      {message}
    </div>
  );
}

function RegionPanel({
  title,
  games,
  incomingGames,
  getProjectedGame,
  getValidWinner,
  getTeam,
  getEntrantLabel,
  isEliminatedOpeningPick,
  reverseRounds,
}: {
  title: string;
  games: Game[];
  incomingGames: Map<string, Game[]>;
  getProjectedGame: (game: Game) => Game;
  getValidWinner: (game: Game) => Team | undefined;
  getTeam: (id: string | null) => Team | undefined;
  getEntrantLabel: (id: string | null) => string;
  isEliminatedOpeningPick: (
    gameId: string,
    originalSlotId: string | null,
    displayedTeamId: string | null
  ) => boolean;
  reverseRounds: boolean;
}) {
  // The right-hand regions reverse the columns so advancement moves inward.
  const rounds = reverseRounds ? [4, 3, 2, 1] : [1, 2, 3, 4];

  const gamesByRound = new Map<number, Game[]>();

  for (const round of [1, 2, 3, 4]) {
    gamesByRound.set(
      round,
      games
        .filter((game) => game.round === round)
        .sort(
          (a, b) =>
            a.game_number - b.game_number || a.id.localeCompare(b.id)
        )
    );
  }

  // Assign each Round of 64 matchup one of the eight vertical bracket slots.
  // Later-round positions are derived from their actual feeder games.
  const slotRanges = new Map<string, SlotRange>();

  const firstRoundGames = gamesByRound.get(1) ?? [];

  firstRoundGames.forEach((game, index) => {
    slotRanges.set(game.id, {
      start: index,
      end: index,
    });
  });

  for (const round of [2, 3, 4]) {
    const roundGames = gamesByRound.get(round) ?? [];
    const expectedSpan = Math.pow(2, round - 1);

    roundGames.forEach((game, index) => {
      const feeders = (incomingGames.get(game.id) ?? []).filter(
        (feeder) =>
          feeder.round === round - 1 &&
          feeder.region === title
      );

      const feederRanges = feeders
        .map((feeder) => slotRanges.get(feeder.id))
        .filter((range): range is SlotRange => !!range);

      if (feederRanges.length > 0) {
        slotRanges.set(game.id, {
          start: Math.min(...feederRanges.map((range) => range.start)),
          end: Math.max(...feederRanges.map((range) => range.end)),
        });
      } else {
        // Fallback keeps incomplete or partially configured trees visible.
        const start = Math.min(index * expectedSpan, 7);

        slotRanges.set(game.id, {
          start,
          end: Math.min(start + expectedSpan - 1, 7),
        });
      }
    });
  }

  function getRange(game: Game): SlotRange {
    return (
      slotRanges.get(game.id) ?? {
        start: 0,
        end: 7,
      }
    );
  }

  function getGridPlacement(game: Game): React.CSSProperties {
    const range = getRange(game);
    const start = Math.max(0, Math.min(range.start, 7));
    const end = Math.max(start, Math.min(range.end, 7));

    return {
      gridRow: `${start + 1} / ${end + 2}`,
      alignSelf: "center",
      position: "relative",
      zIndex: 2,
    };
  }

  // Build connector paths from the real winner_to_game_id relationships.
  // The SVG uses the same eight vertical slots as the matchup grid.
  const roundColumnIndex = new Map<number, number>();

  rounds.forEach((round, index) => {
    roundColumnIndex.set(round, index);
  });

  const connectorPaths: string[] = [];

  for (const sourceGame of games) {
    const destinationId = sourceGame.winner_to_game_id;
    if (!destinationId) continue;

    const destinationGame = games.find(
      (candidate) => candidate.id === destinationId
    );

    if (
      !destinationGame ||
      destinationGame.round !== sourceGame.round + 1 ||
      sourceGame.region !== title ||
      destinationGame.region !== title
    ) {
      continue;
    }

    const sourceColumn = roundColumnIndex.get(sourceGame.round);
    const destinationColumn = roundColumnIndex.get(
      destinationGame.round
    );

    if (
      sourceColumn == null ||
      destinationColumn == null ||
      Math.abs(sourceColumn - destinationColumn) !== 1
    ) {
      continue;
    }

    const sourceRange = getRange(sourceGame);
    const destinationRange = getRange(destinationGame);

    const sourceCenter =
      (sourceRange.start + sourceRange.end + 1) / 2;
    const destinationCenter =
      (destinationRange.start + destinationRange.end + 1) / 2;

    const sourceY =
      (sourceCenter / 8) * REGION_GRID_HEIGHT;
    const destinationY =
      (destinationCenter / 8) * REGION_GRID_HEIGHT;

    const direction = destinationColumn > sourceColumn ? 1 : -1;
    const boundaryX =
      ((Math.min(sourceColumn, destinationColumn) + 1) / 4) *
      1000;

    const sourceX = boundaryX - direction * 18;
    const destinationX = boundaryX + direction * 18;

    connectorPaths.push(
      `M ${sourceX} ${sourceY} H ${boundaryX} V ${destinationY} H ${destinationX}`
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 px-3 py-2.5">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">
          {title} Region
        </h3>
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
          Regional path
        </span>
      </div>

      {/* Scroll only this region horizontally on narrow screens. */}
      <div className="overflow-x-auto overscroll-x-contain">
        {/* Keep all four rounds wide enough to remain readable. */}
        <div className="min-w-[720px]">
          <div className="grid grid-cols-4 gap-2 px-3 pt-2">
            {rounds.map((round) => (
              <div key={round} className="min-w-0">
                <div className="min-h-8 border-b border-slate-700 pb-1">
                  <p className="text-center text-[9px] font-black uppercase leading-tight tracking-wide text-blue-300">
                    {round === 1
                      ? "Round of 64"
                      : round === 2
                        ? "Round of 32"
                        : round === 3
                          ? "Sweet 16"
                          : "Elite 8"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="relative mx-3 mb-3"
            style={{ height: `${REGION_GRID_HEIGHT}px` }}
          >
            {/* Connector lines sit behind the matchup cards. */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
              viewBox={`0 0 1000 ${REGION_GRID_HEIGHT}`}
              preserveAspectRatio="none"
            >
              {connectorPaths.map((path, index) => (
                <path
                  key={`${title}-connector-${index}`}
                  d={path}
                  fill="none"
                  stroke="#526985"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                />
              ))}
            </svg>

            {/* Each column shares the same eight-row grid. */}
            <div className="relative z-10 grid h-full grid-cols-4 gap-2">
              {rounds.map((round) => {
                const roundGames = gamesByRound.get(round) ?? [];

                return (
                  <div
                    key={round}
                    className="grid min-w-0 grid-rows-8"
                    style={{
                      gridTemplateRows: "repeat(8, minmax(0, 1fr))",
                    }}
                  >
                    {roundGames.map((game) => (
                      <div key={game.id} style={getGridPlacement(game)}>
                        <GameCard
                          game={getProjectedGame(game)}
                          officialGame={game}
                          selectedWinner={getValidWinner(game)}
                          getTeam={getTeam}
                          getEntrantLabel={getEntrantLabel}
                          isEliminatedOpeningPick={isEliminatedOpeningPick}
                          compact
                        />
                      </div>
                    ))}

                    {roundGames.length === 0 && (
                      <div className="row-span-8 flex items-center justify-center">
                        <p className="text-center text-[10px] text-slate-600">
                          —
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameCard({
  game,
  officialGame,
  roundLabel,
  selectedWinner,
  getTeam,
  getEntrantLabel,
  isEliminatedOpeningPick,
  compact = false,
}: {
  game: Game;
  officialGame: Game;
  roundLabel?: string;
  selectedWinner: Team | undefined;
  getTeam: (id: string | null) => Team | undefined;
  getEntrantLabel: (id: string | null) => string;
  isEliminatedOpeningPick: (
    gameId: string,
    originalSlotId: string | null,
    displayedTeamId: string | null
  ) => boolean;
  compact?: boolean;
}) {
  const team1 = getTeam(game.team1_id);
  const team2 = getTeam(game.team2_id);
  const officialWinner = getTeam(officialGame.winner);

  const isFinal =
    officialGame.completed === true ||
    officialGame.status?.toLowerCase() === "final";

  const hasScore =
    officialGame.home_score != null ||
    officialGame.away_score != null;

  const pickWasEliminated =
    isFinal &&
    !!selectedWinner &&
    !!officialGame.winner &&
    selectedWinner.id !== officialGame.winner;

  const pickWasCorrect =
    isFinal &&
    !!selectedWinner &&
    !!officialGame.winner &&
    selectedWinner.id === officialGame.winner;

  const winnerId = selectedWinner?.id;

  const team1EliminatedInOpening = isEliminatedOpeningPick(
    officialGame.id,
    officialGame.team1_id,
    game.team1_id
  );

  const team2EliminatedInOpening = isEliminatedOpeningPick(
    officialGame.id,
    officialGame.team2_id,
    game.team2_id
  );

  const openingRoundPickEliminated =
    (team1EliminatedInOpening && winnerId === game.team1_id) ||
    (team2EliminatedInOpening && winnerId === game.team2_id);

  const anyPickEliminated =
    pickWasEliminated || openingRoundPickEliminated;

  return (
    <details className="group/game min-w-0 overflow-hidden rounded-md border border-slate-700 bg-[#111d30] open:border-blue-400/60">
      <summary
        className={`cursor-pointer list-none transition hover:bg-slate-800/80 [&::-webkit-details-marker]:hidden ${
          compact ? "p-1.5" : "p-2"
        }`}
      >
        <div
          className={`flex min-h-[10px] items-center justify-between gap-1 ${
            compact ? "mb-1" : "mb-1.5"
          }`}
        >
          {roundLabel ? (
            <span className="truncate text-[8px] font-bold uppercase tracking-wide text-slate-500">
              {roundLabel}
            </span>
          ) : (
            <span />
          )}

          {pickWasCorrect ? (
            <span className="shrink-0 text-[9px] font-black text-green-300">
              ✓
            </span>
          ) : anyPickEliminated ? (
            <span className="shrink-0 text-[9px] font-black text-red-300">
              ✕
            </span>
          ) : selectedWinner ? (
            <span className="shrink-0 text-[8px] font-black text-green-300">
              PICK
            </span>
          ) : (
            <span className="shrink-0 text-[8px] text-slate-600">
              —
            </span>
          )}
        </div>

        <CompactTeamRow
          team={team1}
          fallbackLabel={getEntrantLabel(game.team1_id)}
          isSelectedPick={winnerId === team1?.id && !!winnerId}
          isOfficialWinner={officialGame.winner === team1?.id}
          isEliminatedPick={
            (pickWasEliminated && winnerId === team1?.id) ||
            team1EliminatedInOpening
          }
          score={isFinal ? officialGame.home_score : null}
          compact={compact}
        />

        <div className={`${compact ? "my-1" : "my-1.5"} border-t border-slate-700/70`} />

        <CompactTeamRow
          team={team2}
          fallbackLabel={getEntrantLabel(game.team2_id)}
          isSelectedPick={winnerId === team2?.id && !!winnerId}
          isOfficialWinner={officialGame.winner === team2?.id}
          isEliminatedPick={
            (pickWasEliminated && winnerId === team2?.id) ||
            team2EliminatedInOpening
          }
          score={isFinal ? officialGame.away_score : null}
          compact={compact}
        />

        <div className={`flex items-center justify-between ${compact ? "mt-1" : "mt-1.5"}`}>
          {isFinal ? (
            <span className="text-[8px] font-bold uppercase tracking-wide text-blue-300">
              Final
            </span>
          ) : openingRoundPickEliminated ? (
            <span className="truncate text-[8px] font-bold text-red-300">
              Opening pick eliminated
            </span>
          ) : selectedWinner ? (
            <span className="text-[8px] font-semibold text-green-300">
              Pick saved
            </span>
          ) : (
            <span className="text-[8px] text-slate-600">
              Awaiting result
            </span>
          )}
          <span className="shrink-0 text-[9px] text-slate-600 transition group-open/game:rotate-180">
            ⌄
          </span>
        </div>
      </summary>

      {/* Expanded matchup details */}
      <div className="border-t border-slate-700 bg-slate-950/70 p-3">
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-blue-300">
          Matchup details
        </p>

        <div className="space-y-2 text-[11px]">
          <DetailLine
            label="Your selection"
            value={selectedWinner?.team_name ?? "No pick saved"}
            valueColor={selectedWinner ? "text-green-300" : "text-slate-500"}
          />

          <DetailLine
            label="Official winner"
            value={
              isFinal
                ? officialWinner?.team_name ?? "Not recorded"
                : "Game not final"
            }
            valueColor={isFinal ? "text-blue-300" : "text-slate-500"}
          />

          {isFinal && hasScore && (
            <DetailLine
              label="Final score"
              value={`${officialGame.home_score ?? "—"} – ${officialGame.away_score ?? "—"}`}
              valueColor="text-white"
            />
          )}

          {pickWasCorrect && (
            <p className="rounded bg-green-400/10 px-2.5 py-2 font-bold text-green-300">
              Your pick was correct.
            </p>
          )}

          {pickWasEliminated && (
            <p className="rounded bg-red-400/10 px-2.5 py-2 font-bold text-red-300">
              Your selected team lost this game. Your original pick remains saved.
            </p>
          )}

          {openingRoundPickEliminated && (
            <p className="rounded bg-red-400/10 px-2.5 py-2 font-bold text-red-300">
              Your selected team was eliminated in the Opening Round. It remains
              visible here as your original Round of 64 pick.
            </p>
          )}

          {!isFinal && selectedWinner && !openingRoundPickEliminated && (
            <p className="rounded bg-slate-800 px-2.5 py-2 text-slate-300">
              Your selection is still alive pending the official result.
            </p>
          )}
        </div>
      </div>
    </details>
  );
}

function CompactTeamRow({
  team,
  fallbackLabel,
  isSelectedPick,
  isOfficialWinner,
  isEliminatedPick,
  score,
  compact = false,
}: {
  team: Team | undefined;
  fallbackLabel: string;
  isSelectedPick: boolean;
  isOfficialWinner: boolean;
  isEliminatedPick: boolean;
  score: number | null;
  compact?: boolean;
}) {
  const isCorrectPick = isSelectedPick && isOfficialWinner;

  const colorClass = isEliminatedPick
    ? "text-red-300 line-through decoration-2 decoration-red-400"
    : isCorrectPick
      ? "text-green-300"
      : isSelectedPick
        ? "text-green-200"
        : isOfficialWinner
          ? "text-blue-200"
          : "text-slate-300";

  return (
    <div className={`flex min-w-0 items-center ${compact ? "gap-1" : "gap-1.5"}`}>
      <span
        className={`shrink-0 text-right tabular-nums text-slate-500 ${
          compact ? "w-4 text-[8px]" : "w-5 text-[9px] sm:text-[10px]"
        }`}
      >
        {team?.seed ?? "–"}
      </span>

      <span
        className={`min-w-0 flex-1 truncate font-bold leading-tight ${colorClass} ${
          compact ? "text-[9px]" : "text-[10px] sm:text-[11px]"
        }`}
        title={team?.team_name ?? fallbackLabel}
      >
        {team?.team_name ?? fallbackLabel}
      </span>

      {score != null && (
        <span className="shrink-0 text-[9px] font-black tabular-nums text-white">
          {score}
        </span>
      )}

      {isEliminatedPick && (
        <span className="shrink-0 text-[8px] font-black text-red-300">
          ✕
        </span>
      )}

      {isCorrectPick && (
        <span className="shrink-0 text-[8px] font-black text-green-300">
          ✓
        </span>
      )}

      {!isSelectedPick && isOfficialWinner && (
        <span className="shrink-0 text-[8px] font-black text-blue-300">
          W
        </span>
      )}
    </div>
  );
}

function DetailLine({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}
