"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useRouter } from "next/navigation";
import CheatSheetPanel from "@/components/cheatsheet/CheatSheetPanel";

type Game = {
  id: string;
  game_number: number;
  round: number;
  region: string | null;
  team1_id: string | null;
  team2_id: string | null;
  winner_to_game_id: string | null;
};

type Team = {
  id: string;
  team_name: string;
  seed: number | null;
  region: string | null;
  logo_url?: string | null;
  conference?: string | null;
  record?: string | null;
  sos?: string | null;
  vs_top_10?: string | null;
  last_10?: string | null;
  espn_id?: string | null;
};

type RegionName =
  | "Opening Round"
  | "West"
  | "East"
  | "South"
  | "Midwest"
  | "Final Four"
  | "Championship";

type MatchupContext = {
  game: Game;
  team1: Team | undefined;
  team2: Team | undefined;
  team1IsOpeningRoundTeam: boolean;
  team2IsOpeningRoundTeam: boolean;
};

type GameLayout = {
  start: number;
  end: number;
  center: number;
  span: number;
};

const OPENING_PREFIX = "opening-";

export default function DynamicBracketBuilder({
  params,
}: {
  params: Promise<{ bracketId: string }>;
}) {
  const { bracketId } = React.use(params);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [activeRegion, setActiveRegion] =
    useState<RegionName>("Opening Round");
  const [showOpeningInfo, setShowOpeningInfo] = useState(false);
  const [selectedMatchup, setSelectedMatchup] =
    useState<MatchupContext | null>(null);

  const [userName, setUserName] = useState("");
  const [bracketName, setBracketName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setLoadError("");

      try {
        const { data: bracket, error: bracketError } = await supabase
          .from("brackets")
          .select("*")
          .eq("bracket_id", bracketId)
          .single();

        if (bracketError) throw bracketError;

        const { data: gameData, error: gameError } = await supabase
          .from("tournament_games")
          .select(
            "id, game_number, round, region, team1_id, team2_id, winner_to_game_id"
          )
          .is("bracket_id", null)
          .order("round", { ascending: true })
          .order("game_number", { ascending: true });

        if (gameError) throw gameError;

        const { data: teamData, error: teamError } = await supabase
          .from("tournament_teams")
          .select("*");

        if (teamError) throw teamError;

        const { data: pickData, error: pickError } = await supabase
          .from("bracket_picks")
          .select("game_id, picked_team, winner_team_id")
          .eq("bracket_id", bracketId);

        if (pickError) throw pickError;

        if (cancelled) return;

        const pickMap: Record<string, string> = {};

        (pickData || []).forEach((pick) => {
          const selectedTeam = pick.picked_team || pick.winner_team_id;

          if (
            typeof selectedTeam === "string" &&
            !selectedTeam.startsWith(OPENING_PREFIX)
          ) {
            pickMap[pick.game_id] = selectedTeam;
          }
        });

        setUserName(bracket?.user_name || "");
        setBracketName(bracket?.bracket_name || "");
        setGames((gameData || []) as Game[]);
        setTeams(teamData || []);
        setPicks(pickMap);
      } catch (error: any) {
        console.error("Error loading bracket:", error);

        if (!cancelled) {
          setLoadError(error?.message || "Unable to load this bracket.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [bracketId]);

  const teamMap = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams]
  );

  const gameMap = useMemo(
    () => new Map(games.map((game) => [game.id, game])),
    [games]
  );

  /*
   * Project the user's selected winners through the official tournament tree.
   * The official game relationships remain the source of advancement order.
   */
  const projectedGames = useMemo(() => {
    const projected = games.map((game) => ({ ...game }));

    const projectedMap = new Map(
      projected.map((game) => [game.id, game])
    );

    const incoming = new Map<string, Game[]>();

    projected.forEach((game) => {
      if (!game.winner_to_game_id) return;

      const feeders = incoming.get(game.winner_to_game_id) || [];
      feeders.push(game);
      incoming.set(game.winner_to_game_id, feeders);
    });

    incoming.forEach((feeders) => {
      feeders.sort((a, b) => {
        if (a.game_number !== b.game_number) {
          return a.game_number - b.game_number;
        }

        return a.id.localeCompare(b.id);
      });
    });

    const orderedGames = [...projected].sort(
      (a, b) =>
        a.round - b.round ||
        a.game_number - b.game_number ||
        a.id.localeCompare(b.id)
    );

    for (const source of orderedGames) {
      const selectedWinner = picks[source.id];

      if (!selectedWinner || !source.winner_to_game_id) continue;

      const destination = projectedMap.get(source.winner_to_game_id);
      if (!destination) continue;

      const sourceTeam1 = resolveActualTeamId(source.team1_id, picks);
      const sourceTeam2 = resolveActualTeamId(source.team2_id, picks);

      if (
        selectedWinner !== sourceTeam1 &&
        selectedWinner !== sourceTeam2
      ) {
        continue;
      }

      if (source.round === 0) {
        destination.team2_id = selectedWinner;
        continue;
      }

      const feeders = incoming.get(destination.id) || [];
      const feederIndex = feeders.findIndex(
        (feeder) => feeder.id === source.id
      );

      if (feederIndex === 0) {
        destination.team1_id = selectedWinner;
      } else if (feederIndex === 1) {
        destination.team2_id = selectedWinner;
      }
    }

    return projected;
  }, [games, picks]);

  const projectedMap = useMemo(
    () => new Map(projectedGames.map((game) => [game.id, game])),
    [projectedGames]
  );

  function getTeam(id: string | null): Team | undefined {
    if (!id) return undefined;

    if (id.startsWith(OPENING_PREFIX)) {
      const openingGameId = id.slice(OPENING_PREFIX.length);
      const selectedTeamId = picks[openingGameId];

      if (!selectedTeamId) return undefined;

      return teamMap.get(selectedTeamId);
    }

    return teamMap.get(id);
  }

  function getTeamLabel(id: string | null): string | undefined {
    if (!id) return undefined;

    if (id.startsWith(OPENING_PREFIX)) {
      const openingGameId = id.slice(OPENING_PREFIX.length);
      const openingGame = gameMap.get(openingGameId);

      if (!openingGame) return "Winner of Opening Round game";

      const selectedTeamId = picks[openingGameId];

      if (selectedTeamId) {
        return (
          teamMap.get(selectedTeamId)?.team_name || "Selected winner"
        );
      }

      const team1 = teamMap.get(openingGame.team1_id || "");
      const team2 = teamMap.get(openingGame.team2_id || "");

      const name1 = team1?.team_name || "TBD";
      const name2 = team2?.team_name || "TBD";

      return `Winner of ${name1} vs ${name2}`;
    }

    return teamMap.get(id)?.team_name;
  }

  function canPickEntrant(id: string | null): boolean {
    if (!id) return false;

    if (id.startsWith(OPENING_PREFIX)) {
      const openingGameId = id.slice(OPENING_PREFIX.length);
      return Boolean(picks[openingGameId]);
    }

    return Boolean(teamMap.has(id));
  }

  function getLogoUrl(team: Team | undefined) {
    if (!team) return "/images/logos/default.png";

    return team.logo_url || "/images/logos/default.png";
  }

  function clearDownstreamPicks(
    startingGameId: string,
    currentPicks: Record<string, string>
  ) {
    const cleared = { ...currentPicks };
    const visited = new Set<string>();
    const queue = [startingGameId];

    while (queue.length) {
      const currentId = queue.shift()!;

      if (visited.has(currentId)) continue;

      visited.add(currentId);

      const currentGame = gameMap.get(currentId);
      const destinationId = currentGame?.winner_to_game_id;

      if (!destinationId || visited.has(destinationId)) continue;

      delete cleared[destinationId];
      queue.push(destinationId);
    }

    return cleared;
  }

  function handlePick(
    gameId: string,
    teamId: string | null | undefined
  ) {
    if (!teamId) return;
    if (teamId.startsWith(OPENING_PREFIX)) return;
    if (!teamMap.has(teamId)) return;

    const game = projectedMap.get(gameId);
    if (!game) return;

    const entrant1 = getTeam(game.team1_id);
    const entrant2 = getTeam(game.team2_id);

    const isValidEntrant =
      entrant1?.id === teamId || entrant2?.id === teamId;

    if (!isValidEntrant) return;

    setPicks((previous) => {
      if (previous[gameId] === teamId) return previous;

      const updated = clearDownstreamPicks(gameId, previous);
      updated[gameId] = teamId;

      return updated;
    });
  }

 function handleMatchupInfo(game: Game) {
  const displayedGame = projectedMap.get(game.id) || game;

  const team1 = getTeam(displayedGame.team1_id);
  const team2 = getTeam(displayedGame.team2_id);

  // Identify teams using the actual official Opening Round games.
  const openingRoundTeamIds = new Set(
    games
      .filter((officialGame) => officialGame.round === 0)
      .flatMap((officialGame) => [
        officialGame.team1_id,
        officialGame.team2_id,
      ])
      .filter((id): id is string => Boolean(id))
  );

  setSelectedMatchup({
    game: displayedGame,
    team1,
    team2,
    team1IsOpeningRoundTeam: Boolean(
      team1 && openingRoundTeamIds.has(team1.id)
    ),
    team2IsOpeningRoundTeam: Boolean(
      team2 && openingRoundTeamIds.has(team2.id)
    ),
  });
}

  function closeMatchupInfo() {
    setSelectedMatchup(null);
  }

  async function saveBracket() {
    if (saving) return;

    setSaving(true);

    try {
      const stored = localStorage.getItem("bracketUser");
      const currentUser = stored ? JSON.parse(stored) : null;

      if (!currentUser?.email || !currentUser?.user_id) {
        router.push("/sports/march-madness-v2/login");
        return;
      }

      const validPicks: Record<string, string> = {};

      Object.entries(picks).forEach(([gameId, teamId]) => {
        if (
          gameMap.has(gameId) &&
          teamMap.has(teamId) &&
          !teamId.startsWith(OPENING_PREFIX)
        ) {
          validPicks[gameId] = teamId;
        }
      });

      const response = await fetch(
        "/api/march-madness-v2/save-picks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bracket_id: bracketId,
            picks: validPicks,
            email: currentUser.email,
            user_id: currentUser.user_id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to save bracket picks.");
      }

      router.push(
        `/sports/march-madness-v2/bracket/view/${bracketId}`
      );
    } catch (error: any) {
      console.error("Error saving picks:", error);
      window.alert(error?.message || "Unable to save your picks.");
    } finally {
      setSaving(false);
    }
  }

  const regions: RegionName[] = [
    "Opening Round",
    "West",
    "East",
    "South",
    "Midwest",
    "Final Four",
    "Championship",
  ];

  const regionRounds: Record<
    "West" | "East" | "South" | "Midwest",
    Record<number, Game[]>
  > = {
    West: {},
    East: {},
    South: {},
    Midwest: {},
  };

  (["West", "East", "South", "Midwest"] as const).forEach((region) => {
    for (let round = 1; round <= 4; round++) {
      regionRounds[region][round] = projectedGames
        .filter(
          (game) => game.region === region && game.round === round
        )
        .sort(
          (a, b) =>
            a.game_number - b.game_number ||
            a.id.localeCompare(b.id)
        );
    }
  });

  const openingRoundGames = projectedGames
    .filter((game) => game.round === 0)
    .sort((a, b) => a.game_number - b.game_number);

  const finalFourGames = projectedGames
    .filter((game) => game.round === 5)
    .sort((a, b) => a.game_number - b.game_number);

  const championshipGame = projectedGames.find(
    (game) => game.round === 6
  );

  const elite8Games = projectedGames.filter(
    (game) => game.round === 4
  );

  const allElite8Picked =
    elite8Games.length > 0 &&
    elite8Games.every((game) => Boolean(picks[game.id]));

  const finalFourPicked =
    finalFourGames.length > 0 &&
    finalFourGames.every((game) => Boolean(picks[game.id]));

  function canActivateTab(region: RegionName) {
    if (region === "Final Four") return allElite8Picked;
    if (region === "Championship") return finalFourPicked;

    return true;
  }

  function handleTabClick(region: RegionName) {
    if (!canActivateTab(region)) return;

    setActiveRegion(region);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-gray-200">
        Loading your bracket...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-red-300">
        Unable to load your bracket: {loadError}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-gray-100">
      <header className="w-full border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col">
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-yellow-400">
              BracketBoss • March Madness 2026–2027
            </span>

            <h1 className="text-2xl font-bold tracking-wide text-white">
              Bracket Builder
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Make your picks. Follow your path to the championship.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
            <div className="min-w-0 text-left leading-tight sm:text-right">
              <div className="truncate text-sm font-semibold text-white/90">
                {userName}
              </div>

              <div className="truncate text-xs text-slate-400">
                {bracketName}
              </div>
            </div>

            <button
              onClick={saveBracket}
              disabled={saving}
              className="shrink-0 rounded-lg bg-green-400 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-green-950/30 transition-all hover:bg-green-300 disabled:cursor-wait disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Picks"}
            </button>
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1800px] px-3 py-5 sm:px-4 lg:px-6 lg:py-7">
          <div className="mb-5 flex min-w-0 gap-2 overflow-x-auto border-b border-slate-800 sm:gap-4">
            {regions.map((region) => {
              const locked = !canActivateTab(region);

              return (
                <button
                  key={region}
                  onClick={() => handleTabClick(region)}
                  className={`whitespace-nowrap border-b-2 px-3 py-3 text-[0.68rem] font-bold uppercase tracking-wider transition-all sm:px-4 sm:text-xs ${
                    activeRegion === region
                      ? "border-yellow-400 text-yellow-300"
                      : locked
                      ? "cursor-not-allowed border-transparent text-slate-600"
                      : "border-transparent text-slate-400 hover:border-slate-600 hover:text-white"
                  }`}
                  title={
                    locked
                      ? region === "Final Four"
                        ? "Complete all Elite 8 games to unlock Final Four."
                        : "Select Final Four winners to unlock Championship."
                      : ""
                  }
                >
                  {locked && (
                    <span className="mr-1.5 text-[0.65rem]">🔒</span>
                  )}
                  {region}
                </button>
              );
            })}
          </div>

          {activeRegion === "Opening Round" && (
            <div className="mb-4">
              <button
                onClick={() =>
                  setShowOpeningInfo((previous) => !previous)
                }
                className="flex items-center gap-2 text-xs text-slate-300 transition-colors hover:text-yellow-300"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-500 text-[0.7rem]">
                  i
                </span>

                <span>About the new Opening Round</span>

                <span className="text-slate-500">
                  {showOpeningInfo ? "−" : "+"}
                </span>
              </button>

              {showOpeningInfo && (
                <div className="mt-3 max-w-3xl rounded-lg border border-slate-700 bg-slate-900 p-4 text-xs text-slate-300 shadow-lg">
                  <p className="mb-2 font-bold text-white">
                    Opening Round (2026–2027 and beyond)
                  </p>

                  <p className="leading-relaxed">
                    Starting in the 2026–2027 season, March Madness will
                    include an Opening Round with 12 games—24 teams
                    competing to move on to the traditional Round of 64.
                    These games determine which teams advance into the
                    main bracket, adding an extra layer of strategy and
                    excitement before the field is set.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-6">
            {activeRegion === "Opening Round" && (
              <OpeningRoundBlock
                title="Opening Round"
                games={openingRoundGames}
                picks={picks}
                getTeam={getTeam}
                getTeamLabel={getTeamLabel}
                canPickEntrant={canPickEntrant}
                getLogoUrl={getLogoUrl}
                onPick={handlePick}
                onInfo={handleMatchupInfo}
              />
            )}

            {(
              ["West", "East", "South", "Midwest"] as const
            ).includes(activeRegion as any) && (
              <RegionBracket
                title={
                  activeRegion as
                    | "West"
                    | "East"
                    | "South"
                    | "Midwest"
                }
                rounds={
                  regionRounds[
                    activeRegion as
                      | "West"
                      | "East"
                      | "South"
                      | "Midwest"
                  ]
                }
                picks={picks}
                getTeam={getTeam}
                getTeamLabel={getTeamLabel}
                canPickEntrant={canPickEntrant}
                getLogoUrl={getLogoUrl}
                onPick={handlePick}
                onInfo={handleMatchupInfo}
              />
            )}

            {activeRegion === "Final Four" && (
              <FinalFourBlock
                games={finalFourGames}
                picks={picks}
                getTeam={getTeam}
                getTeamLabel={getTeamLabel}
                canPickEntrant={canPickEntrant}
                getLogoUrl={getLogoUrl}
                onPick={handlePick}
                onInfo={handleMatchupInfo}
              />
            )}

            {activeRegion === "Championship" && (
              <ChampionshipBlock
                game={championshipGame}
                picks={picks}
                getTeam={getTeam}
                getTeamLabel={getTeamLabel}
                canPickEntrant={canPickEntrant}
                getLogoUrl={getLogoUrl}
                onPick={handlePick}
                onInfo={handleMatchupInfo}
              />
            )}
          </div>
        </div>
      </main>

      {/* The Cheat Sheet is rendered as a viewport-level overlay. */}
      <CheatSheetPanel
        selectedMatchup={selectedMatchup}
        onClose={closeMatchupInfo}
      />
    </div>
  );
}

/*
 * Resolves an Opening Round placeholder into its selected winner.
 */
function resolveActualTeamId(
  id: string | null,
  picks: Record<string, string>
): string | null {
  if (!id) return null;

  if (id.startsWith(OPENING_PREFIX)) {
    const openingGameId = id.slice(OPENING_PREFIX.length);
    return picks[openingGameId] || null;
  }

  return id;
}

/* -------------------------------------------------------------------------- */
/* REGION BRACKET                                                             */
/* -------------------------------------------------------------------------- */

function RegionBracket({
  title,
  rounds,
  picks,
  getTeam,
  getTeamLabel,
  canPickEntrant,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  title: "West" | "East" | "South" | "Midwest";
  rounds: Record<number, Game[]>;
  picks: Record<string, string>;
  getTeam: (id: string | null) => Team | undefined;
  getTeamLabel: (id: string | null) => string | undefined;
  canPickEntrant: (id: string | null) => boolean;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  const allRegionGames = useMemo(
    () => [1, 2, 3, 4].flatMap((round) => rounds[round] || []),
    [rounds]
  );

  const layoutByGame = useMemo(() => {
    const layout = new Map<string, GameLayout>();
    const incoming = new Map<string, Game[]>();

    allRegionGames.forEach((game) => {
      if (!game.winner_to_game_id) return;

      const feeders = incoming.get(game.winner_to_game_id) || [];
      feeders.push(game);
      incoming.set(game.winner_to_game_id, feeders);
    });

    incoming.forEach((feeders) => {
      feeders.sort(
        (a, b) =>
          a.game_number - b.game_number ||
          a.id.localeCompare(b.id)
      );
    });

    const firstRound = [...(rounds[1] || [])].sort(
      (a, b) =>
        a.game_number - b.game_number ||
        a.id.localeCompare(b.id)
    );

    firstRound.forEach((game, index) => {
      layout.set(game.id, {
        start: index,
        end: index,
        center: index,
        span: 1,
      });
    });

    function getLayout(
      game: Game,
      visited = new Set<string>()
    ): GameLayout | undefined {
      const existing = layout.get(game.id);
      if (existing) return existing;

      if (visited.has(game.id)) return undefined;

      const nextVisited = new Set(visited);
      nextVisited.add(game.id);

      const feeders = (incoming.get(game.id) || []).filter(
        (feeder) => feeder.round === game.round - 1
      );

      const feederLayouts = feeders
        .map((feeder) => getLayout(feeder, nextVisited))
        .filter((item): item is GameLayout => Boolean(item));

      if (feederLayouts.length > 0) {
        const start = Math.min(
          ...feederLayouts.map((item) => item.start)
        );

        const end = Math.max(
          ...feederLayouts.map((item) => item.end)
        );

        const result: GameLayout = {
          start,
          end,
          center: (start + end) / 2,
          span: end - start + 1,
        };

        layout.set(game.id, result);
        return result;
      }

      // Fallback for incomplete or partially initialized tournament trees.
      const roundGames = [...(rounds[game.round] || [])].sort(
        (a, b) =>
          a.game_number - b.game_number ||
          a.id.localeCompare(b.id)
      );

      const index = roundGames.findIndex(
        (item) => item.id === game.id
      );

      if (index < 0) return undefined;

      const span = Math.pow(2, game.round);
      const start = index * span;

      const result: GameLayout = {
        start,
        end: start + span - 1,
        center: start + (span - 1) / 2,
        span,
      };

      layout.set(game.id, result);
      return result;
    }

    [2, 3, 4].forEach((round) => {
      (rounds[round] || []).forEach((game) => getLayout(game));
    });

    return layout;
  }, [allRegionGames, rounds]);

  const roundLabels: Record<number, string> = {
    1: "Round of 64",
    2: "Round of 32",
    3: "Sweet 16",
    4: "Elite 8",
  };

  const connectorPaths = useMemo(() => {
    const paths: string[] = [];

    allRegionGames.forEach((source) => {
      if (!source.winner_to_game_id) return;

      const destination = allRegionGames.find(
        (game) => game.id === source.winner_to_game_id
      );

      if (!destination) return;
      if (destination.round !== source.round + 1) return;

      const sourceLayout = layoutByGame.get(source.id);
      const destinationLayout = layoutByGame.get(destination.id);

      if (!sourceLayout || !destinationLayout) return;

      const sourceY = ((sourceLayout.center + 0.5) / 8) * 800;
      const destinationY =
        ((destinationLayout.center + 0.5) / 8) * 800;

      const sourceX = source.round * 25 - 1.5;
      const destinationX = destination.round * 25 + 1.5;
      const elbowX = (sourceX + destinationX) / 2;

      paths.push(
        `M ${sourceX} ${sourceY} H ${elbowX} V ${destinationY} H ${destinationX}`
      );
    });

    return paths;
  }, [allRegionGames, layoutByGame]);

  const hasGames = allRegionGames.length > 0;

  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-xl shadow-black/10 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-yellow-400">
            Regional bracket
          </p>

          <h2 className="text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
            {title} Region
          </h2>
        </div>

        <div className="hidden items-center gap-2 text-[0.65rem] text-slate-400 sm:flex">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Selected to advance
        </div>
      </div>

      {!hasGames ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-8 text-center text-sm text-slate-500">
          Regional games are not available yet.
        </div>
      ) : (
        <div className="w-full min-w-0">
          <div className="mb-3 grid min-w-0 grid-cols-4 gap-x-2 sm:gap-x-3">
            {[1, 2, 3, 4].map((round) => (
              <div
                key={round}
                className="min-w-0 text-center text-[0.55rem] font-bold uppercase tracking-wide text-slate-400 sm:text-[0.65rem] sm:tracking-wider"
              >
                {roundLabels[round]}
              </div>
            ))}
          </div>

          <div
            className="relative grid min-w-0 grid-cols-4 gap-x-2 sm:gap-x-3"
            style={{
              gridTemplateRows: "repeat(8, minmax(104px, auto))",
            }}
          >
            {/* Advancement connectors sit behind the matchup cards. */}
            <svg
              className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
              viewBox="0 0 100 800"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {connectorPaths.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="1.1"
                  strokeOpacity="0.55"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {[1, 2, 3, 4].map((round) => {
              const roundGames = rounds[round] || [];

              return roundGames.map((game) => {
                const position = layoutByGame.get(game.id);

                if (!position) return null;

                return (
                  <div
                    key={game.id}
                    className="relative z-10 flex min-w-0 items-center px-0.5"
                    style={{
                      gridColumn: round,
                      gridRow: `${position.start + 1} / span ${position.span}`,
                    }}
                  >
                    <MatchupCard
                      game={game}
                      team1={getTeam(game.team1_id)}
                      team2={getTeam(game.team2_id)}
                      team1Label={getTeamLabel(game.team1_id)}
                      team2Label={getTeamLabel(game.team2_id)}
                      team1Selectable={canPickEntrant(game.team1_id)}
                      team2Selectable={canPickEntrant(game.team2_id)}
                      winnerId={picks[game.id]}
                      getLogoUrl={getLogoUrl}
                      onPick={onPick}
                      onInfo={onInfo}
                    />
                  </div>
                );
              });
            })}
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 text-[0.65rem] text-slate-400 sm:hidden">
        <span className="h-2 w-2 rounded-full bg-green-400" />
        Selected to advance
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* OPENING ROUND                                                              */
/* -------------------------------------------------------------------------- */

function OpeningRoundBlock({
  title,
  games,
  picks,
  getTeam,
  getTeamLabel,
  canPickEntrant,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  title: string;
  games: Game[];
  picks: Record<string, string>;
  getTeam: (id: string | null) => Team | undefined;
  getTeamLabel: (id: string | null) => string | undefined;
  canPickEntrant: (id: string | null) => boolean;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  if (games.length === 0) return null;

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-black/10 sm:p-5">
      <div className="mb-5 text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-yellow-400">
          The road to the Round of 64
        </p>

        <h2 className="text-xl font-bold uppercase tracking-wide text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Select the winner of each matchup to fill the main bracket.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {games.map((game) => (
          <MatchupCard
            key={game.id}
            game={game}
            team1={getTeam(game.team1_id)}
            team2={getTeam(game.team2_id)}
            team1Label={getTeamLabel(game.team1_id)}
            team2Label={getTeamLabel(game.team2_id)}
            team1Selectable={canPickEntrant(game.team1_id)}
            team2Selectable={canPickEntrant(game.team2_id)}
            winnerId={picks[game.id]}
            getLogoUrl={getLogoUrl}
            onPick={onPick}
            onInfo={onInfo}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MATCHUP CARD                                                               */
/* -------------------------------------------------------------------------- */

function MatchupCard({
  game,
  team1,
  team2,
  team1Label,
  team2Label,
  team1Selectable,
  team2Selectable,
  winnerId,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  game: Game;
  team1: Team | undefined;
  team2: Team | undefined;
  team1Label?: string;
  team2Label?: string;
  team1Selectable: boolean;
  team2Selectable: boolean;
  winnerId: string | undefined;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  return (
    <div className="w-full min-w-0 space-y-2 rounded-lg border border-slate-700 bg-slate-800/95 p-2.5 shadow-md shadow-black/10 transition-colors hover:border-slate-500">
      <div className="flex items-center justify-end">
        <button
          onClick={() => onInfo(game)}
          className="inline-flex items-center gap-1.5 text-[0.65rem] text-slate-400 transition-colors hover:text-yellow-300"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-500 text-[0.6rem]">
            i
          </span>

          <span>Matchup info</span>
        </button>
      </div>

      <TeamPickRow
        team={team1}
        label={team1Label}
        isWinner={Boolean(team1 && winnerId === team1.id)}
        selectable={team1Selectable}
        logoUrl={getLogoUrl(team1)}
        onPick={() => onPick(game.id, team1?.id)}
      />

      <TeamPickRow
        team={team2}
        label={team2Label}
        isWinner={Boolean(team2 && winnerId === team2.id)}
        selectable={team2Selectable}
        logoUrl={getLogoUrl(team2)}
        onPick={() => onPick(game.id, team2?.id)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TEAM PICK ROW                                                              */
/* -------------------------------------------------------------------------- */

function TeamPickRow({
  team,
  label,
  isWinner,
  selectable,
  logoUrl,
  onPick,
}: {
  team: Team | undefined;
  label?: string;
  isWinner: boolean;
  selectable: boolean;
  logoUrl: string;
  onPick: () => void;
}) {
  const displayLabel = team
    ? `${team.seed ? `${team.seed} ` : ""}${team.team_name}`
    : label || "TBD";

  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onPick}
      title={
        !selectable
          ? "Make the previous-round pick first."
          : isWinner
          ? "This team is selected to advance. Click the other team to change your pick."
          : "Select this team to advance."
      }
      className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-md border px-2 py-2 text-left transition-all ${
        isWinner
          ? "border-green-300 bg-green-400 text-slate-950 shadow-md shadow-green-950/30"
          : selectable
          ? "border-slate-600 bg-slate-700 text-gray-100 hover:border-slate-400 hover:bg-slate-600"
          : "cursor-not-allowed border-slate-700 bg-slate-800/80 text-slate-500"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <img
          src={logoUrl}
          alt={team?.team_name || "Team logo"}
          className={`h-5 w-5 shrink-0 rounded-full border object-cover ${
            isWinner ? "border-green-700/50" : "border-slate-600"
          }`}
        />

        <span
          className={`min-w-0 break-words text-xs font-semibold leading-tight ${
            isWinner ? "text-slate-950" : ""
          }`}
        >
          {displayLabel}
        </span>
      </div>

      {isWinner && (
        <span className="ml-1 shrink-0 text-[0.6rem] font-black tracking-wide">
          WIN
        </span>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* FINAL FOUR                                                                 */
/* -------------------------------------------------------------------------- */

function FinalFourBlock({
  games,
  picks,
  getTeam,
  getTeamLabel,
  canPickEntrant,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  games: Game[];
  picks: Record<string, string>;
  getTeam: (id: string | null) => Team | undefined;
  getTeamLabel: (id: string | null) => string | undefined;
  canPickEntrant: (id: string | null) => boolean;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  if (games.length === 0) return null;

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-black/10 sm:p-5">
      <div className="mb-5 text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-yellow-400">
          The final four teams
        </p>

        <h2 className="text-xl font-bold uppercase tracking-wide text-white">
          Final Four
        </h2>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {games.map((game) => (
          <MatchupCard
            key={game.id}
            game={game}
            team1={getTeam(game.team1_id)}
            team2={getTeam(game.team2_id)}
            team1Label={getTeamLabel(game.team1_id)}
            team2Label={getTeamLabel(game.team2_id)}
            team1Selectable={canPickEntrant(game.team1_id)}
            team2Selectable={canPickEntrant(game.team2_id)}
            winnerId={picks[game.id]}
            getLogoUrl={getLogoUrl}
            onPick={onPick}
            onInfo={onInfo}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CHAMPIONSHIP                                                               */
/* -------------------------------------------------------------------------- */

function ChampionshipBlock({
  game,
  picks,
  getTeam,
  getTeamLabel,
  canPickEntrant,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  game: Game | undefined;
  picks: Record<string, string>;
  getTeam: (id: string | null) => Team | undefined;
  getTeamLabel: (id: string | null) => string | undefined;
  canPickEntrant: (id: string | null) => boolean;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  if (!game) return null;

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-yellow-500/60 bg-slate-900/80 p-4 shadow-xl shadow-yellow-950/10 sm:p-5">
      <div className="mb-5 text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-yellow-400">
          One final pick
        </p>

        <h2 className="text-xl font-bold uppercase tracking-wide text-yellow-300">
          National Championship
        </h2>
      </div>

      <MatchupCard
        game={game}
        team1={getTeam(game.team1_id)}
        team2={getTeam(game.team2_id)}
        team1Label={getTeamLabel(game.team1_id)}
        team2Label={getTeamLabel(game.team2_id)}
        team1Selectable={canPickEntrant(game.team1_id)}
        team2Selectable={canPickEntrant(game.team2_id)}
        winnerId={picks[game.id]}
        getLogoUrl={getLogoUrl}
        onPick={onPick}
        onInfo={onInfo}
      />
    </div>
  );
}