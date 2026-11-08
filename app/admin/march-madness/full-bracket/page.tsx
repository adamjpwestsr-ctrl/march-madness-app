"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Team = {
  id: string;
  team_name: string;
  seed: number | null;
  region: string | null;
};

type Game = {
  id?: string;
  game_number: number;
  round: number;
  region: string | null;
  team1_id: string | null;
  team2_id: string | null;
};

type OpeningRoundGame = {
  id: string;
  game_number: number;
  team1_id: string | null;
  team2_id: string | null;
  winner_to_game_id: string | null;
  region: string | null;
};

const ROUND_OPTIONS = [
  { label: "Opening Round", value: 0 },
  { label: "Round of 64", value: 1 },
  { label: "Round of 32", value: 2 },
  { label: "Sweet 16", value: 3 },
  { label: "Elite 8", value: 4 },
  { label: "Final 4", value: 5 },
  { label: "Championship", value: 6 },
];

const REGION_OPTIONS = ["East", "Midwest", "South", "West"];

export default function AdminFullBracketPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [openingRoundGames, setOpeningRoundGames] = useState<
    OpeningRoundGame[]
  >([]);
  const [round64Games, setRound64Games] = useState<Game[]>([]);

  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [selectedRegion, setSelectedRegion] = useState<string>("East");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [creatingSlots, setCreatingSlots] = useState<boolean>(false);

  function getOpeningRoundTeamName(teamId: string | null): string {
    if (!teamId) return "TBD";
    return teams.find((team) => team.id === teamId)?.team_name ?? "TBD";
  }

  const loadTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from("tournament_teams")
      .select("*")
      .order("region", { ascending: true })
      .order("seed", { ascending: true });

    if (error) throw error;
    setTeams((data ?? []) as Team[]);
  }, [supabase]);

  const loadOpeningRound = useCallback(async () => {
    const { data, error } = await supabase
      .from("tournament_games")
      .select(
        "id, game_number, team1_id, team2_id, winner_to_game_id, region"
      )
      .eq("round", 0)
      .is("bracket_id", null)
      .order("game_number", { ascending: true });

    if (error) throw error;
    setOpeningRoundGames((data ?? []) as OpeningRoundGame[]);
  }, [supabase]);

  const loadRound64 = useCallback(async () => {
    const { data, error } = await supabase
      .from("tournament_games")
      .select("id, game_number, round, region, team1_id, team2_id")
      .eq("round", 1)
      .is("bracket_id", null)
      .order("game_number", { ascending: true });

    if (error) throw error;
    setRound64Games((data ?? []) as Game[]);
  }, [supabase]);

  const loadSelectedRound = useCallback(async () => {
    let query = supabase
      .from("tournament_games")
      .select("id, game_number, round, region, team1_id, team2_id")
      .eq("round", selectedRound)
      .is("bracket_id", null)
      .order("game_number", { ascending: true });

    if (selectedRound > 0) {
      query = query.eq("region", selectedRegion);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      setGames(data as Game[]);
      return;
    }

    const roundSizes: Record<number, number> = {
      0: openingRoundGames.length || 12,
      1: 8,
      2: 4,
      3: 2,
      4: 1,
      5: 2,
      6: 1,
    };

    const count = roundSizes[selectedRound] ?? 0;
    const placeholders: Game[] = [];

    for (let i = 0; i < count; i++) {
      placeholders.push({
        game_number: selectedRound * 100 + i + 1,
        round: selectedRound,
        region: selectedRound === 0 ? null : selectedRegion,
        team1_id: null,
        team2_id: null,
      });
    }

    setGames(placeholders);
  }, [supabase, selectedRound, selectedRegion, openingRoundGames.length]);

  // Load teams.
  useEffect(() => {
    loadTeams().catch((error) => {
      alert("Error loading teams: " + error.message);
    });
  }, [loadTeams]);

  // Load shared Opening Round games.
  useEffect(() => {
    loadOpeningRound().catch((error) => {
      alert("Error loading Opening Round games: " + error.message);
    });
  }, [loadOpeningRound]);

  // Load all shared Round of 64 games.
  useEffect(() => {
    loadRound64().catch((error) => {
      alert("Error loading Round of 64 games: " + error.message);
    });
  }, [loadRound64]);

  // Load games for the selected round and region.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);

      try {
        await loadSelectedRound();
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          alert("Error loading games: " + message);
          setGames([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [loadSelectedRound]);

  function updateGame(index: number, field: keyof Game, value: any) {
    setGames((previous) => {
      const updated = [...previous];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  }

  function getOpeningRoundSource(game: Game): OpeningRoundGame | undefined {
    if (!game.id) return undefined;

    return openingRoundGames.find(
      (openingGame) =>
        openingGame.winner_to_game_id === game.id ||
        game.team2_id === `opening-${openingGame.id}`
    );
  }

  function getProjectedRound64(): Game[] {
    return round64Games.map((game) => {
      const editedGame = games.find((item) => item.id === game.id);
      return editedGame ? { ...game, ...editedGame } : { ...game };
    });
  }

  function isOpeningWinnerAssignedElsewhere(
    winnerId: string,
    currentGameId: string | undefined
  ): boolean {
    const projectedGames = getProjectedRound64();

    return projectedGames.some(
      (otherGame) =>
        otherGame.id !== currentGameId && otherGame.team2_id === winnerId
    );
  }

  // Save the selected round without overwriting unrelated game data.
  async function saveCurrentRound() {
    if (selectedRound === 0) {
      alert("Opening Round matchups are read-only in this editor.");
      return;
    }

    if (saving || creatingSlots) return;

    setSaving(true);

    try {
      const projectedRound64 =
        selectedRound === 1 ? getProjectedRound64() : [];

      // Validate Opening Round assignments before writing anything.
      if (selectedRound === 1) {
        const assignedSources = new Map<string, string>();

        for (const game of projectedRound64) {
          if (!game.team2_id?.startsWith("opening-")) continue;

          const sourceId = game.team2_id.substring("opening-".length);
          const source = openingRoundGames.find(
            (openingGame) => openingGame.id === sourceId
          );

          if (!source) {
            throw new Error(
              `Opening Round source for Round of 64 Game ${game.game_number} could not be found.`
            );
          }

          if (!game.id) {
            throw new Error(
              `Round of 64 Game ${game.game_number} must have a saved game record before an Opening Round winner can be assigned.`
            );
          }

          if (assignedSources.has(sourceId)) {
            throw new Error(
              `Opening Round Game ${source.game_number} has been assigned to more than one Round of 64 game.`
            );
          }

          assignedSources.set(sourceId, game.id);
        }
      }

      // Save only matchup fields for existing games.
      // Scores, results, status, completion, and advancement metadata
      // are deliberately left untouched.
      for (const game of games) {
        if (game.id) {
          let updateQuery = supabase
            .from("tournament_games")
            .update({
              team1_id: game.team1_id,
              team2_id: game.team2_id,
            })
            .eq("id", game.id)
            .eq("round", selectedRound)
            .is("bracket_id", null);

          if (selectedRound > 0) {
            updateQuery = updateQuery.eq("region", selectedRegion);
          }

          const { error } = await updateQuery;
          if (error) throw error;
        } else {
          const { error } = await supabase.from("tournament_games").insert({
            game_number: game.game_number,
            round: game.round,
            region: game.region,
            team1_id: game.team1_id,
            team2_id: game.team2_id,
            home_score: 0,
            away_score: 0,
            winner: null,
            status: "pre",
            is_placeholder: false,
            completed: false,
            winner_to_game_id: null,
            bracket_id: null,
          });

          if (error) throw error;
        }
      }

      // Update Opening Round destination links after Round of 64 saves.
      if (selectedRound === 1) {
        for (const source of openingRoundGames) {
          const placeholderId = `opening-${source.id}`;

          const desiredDestination = projectedRound64.find(
            (game) => game.team2_id === placeholderId
          );

          const desiredDestinationId = desiredDestination?.id ?? null;

          if (source.winner_to_game_id === desiredDestinationId) continue;

          const { error } = await supabase
            .from("tournament_games")
            .update({
              winner_to_game_id: desiredDestinationId,
            })
            .eq("id", source.id)
            .eq("round", 0)
            .is("bracket_id", null);

          if (error) throw error;
        }
      }

      // Refresh editor data after saving.
      await Promise.all([loadRound64(), loadOpeningRound()]);
      await loadSelectedRound();

      alert(
        "Bracket saved for " +
          selectedRegion +
          " • " +
          ROUND_OPTIONS.find((round) => round.value === selectedRound)?.label
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      alert("Error saving bracket: " + message);
    } finally {
      setSaving(false);
    }
  }

  // Create any missing later-round game slots.
  async function createMissingGameSlots() {
    if (saving || creatingSlots) return;

    const confirmed = window.confirm(
      "Create Missing Game Slots?\n\n" +
        "This will verify the Opening Round and Round of 64 setup, " +
        "then create any missing Round of 32, Sweet 16, Elite 8, " +
        "Final 4, and Championship game slots.\n\n" +
        "Existing games and team assignments will be preserved. " +
        "Continue?"
    );

    if (!confirmed) return;

    setCreatingSlots(true);

    try {
      const response = await fetch(
        "/api/march-madness-v2/admin/initialize-tree",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        const details = result.actual
          ? `\nCurrent game counts: ${JSON.stringify(result.actual)}`
          : "";

        throw new Error(
          (result.error || "Unable to create missing game slots.") + details
        );
      }

      // Reload all relevant editor data so the new slots are visible.
      await Promise.all([loadOpeningRound(), loadRound64()]);
      await loadSelectedRound();

      const summary =
        `Tournament game slots are ready.\n\n` +
        `New slots created: ${result.insertedCount ?? 0}\n` +
        `Winner links updated: ${result.linksUpdated ?? 0}\n` +
        `Total official games: ${result.actualTotal ?? "—"}\n\n` +
        `The later-round teams remain unassigned until winners advance.`;

      alert(summary);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      alert("Could not create missing game slots:\n\n" + message);
    } finally {
      setCreatingSlots(false);
    }
  }

  const regionTeams =
    selectedRound === 0
      ? teams
      : teams.filter((team) => team.region === selectedRegion);

  // Do not filter Opening Round winners by region.
  // Some Opening Round games have region = null.
  const openingRoundWinners = openingRoundGames.map((game) => {
    const team1 = getOpeningRoundTeamName(game.team1_id);
    const team2 = getOpeningRoundTeamName(game.team2_id);

    return {
      id: `opening-${game.id}`,
      team_name: `Winner of ${team1} vs ${team2}`,
      seed: null,
      region: game.region,
    };
  });

  const selectedTeamIds = games
    .flatMap((game) => [game.team1_id, game.team2_id])
    .filter(Boolean) as string[];

  const isReadOnlyOpeningRound = selectedRound === 0;
  const isBusy = saving || creatingSlots;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <h1 className="mb-6 text-3xl font-extrabold text-yellow-400">
        Admin • Full Bracket Editor
      </h1>

      {/* Create Missing Game Slots */}
      <div className="mb-8 rounded-lg border border-emerald-700 bg-slate-900 p-5">
        <h2 className="mb-2 text-lg font-bold text-emerald-300">
          Tournament Setup
        </h2>

        <p className="mb-4 text-sm text-slate-300">
          After saving all 12 Opening Round games and all 32 Round of 64
          games, use this button to create any missing later-round game
          slots and connect the winner advancement paths.
        </p>

        <button
          type="button"
          disabled={isBusy}
          onClick={createMissingGameSlots}
          className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creatingSlots
            ? "Creating Missing Game Slots..."
            : "Create Missing Game Slots"}
        </button>
      </div>

      {/* Round Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {ROUND_OPTIONS.map((round) => (
          <button
            key={round.value}
            type="button"
            onClick={() => setSelectedRound(round.value)}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              selectedRound === round.value
                ? "bg-yellow-400 text-slate-900"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            {round.label}
          </button>
        ))}
      </div>

      {/* Region Tabs */}
      {selectedRound > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {REGION_OPTIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => setSelectedRegion(region)}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                selectedRegion === region
                  ? "bg-emerald-500 text-black"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      )}

      {isReadOnlyOpeningRound && (
        <div className="mb-4 text-sm italic text-slate-400">
          Opening Round matchups are read-only here. Edit those matchups in
          the Opening Round Admin page. Assign Opening Round winners to
          Round of 64 games using the Team 2 dropdowns.
        </div>
      )}

      {loading && <p className="text-slate-400">Loading games…</p>}

      {!loading && (
        <>
          {games.length === 0 && (
            <p className="mb-4 text-slate-400">
              No games found for this round and region.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game, index) => {
              const openingSource =
                selectedRound === 1
                  ? getOpeningRoundSource(game)
                  : undefined;

              const openingLabel = openingSource
                ? `${getOpeningRoundTeamName(
                    openingSource.team1_id
                  )} vs ${getOpeningRoundTeamName(openingSource.team2_id)}`
                : null;

              return (
                <div
                  key={game.id ?? `${game.round}-${game.game_number}`}
                  className="flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900 p-4"
                >
                  <h2 className="text-sm font-bold text-yellow-300">
                    {selectedRound === 0
                      ? "Opening Round"
                      : `${selectedRegion} Regional`}
                    {" • Game "}
                    {game.game_number}
                  </h2>

                  {/* Team 1 */}
                  <select
                    disabled={isReadOnlyOpeningRound}
                    className={`rounded-md border border-slate-700 p-2 text-xs ${
                      isReadOnlyOpeningRound
                        ? "cursor-not-allowed bg-slate-700 text-slate-400"
                        : "bg-slate-800"
                    }`}
                    value={game.team1_id || ""}
                    onChange={(event) =>
                      updateGame(
                        index,
                        "team1_id",
                        event.target.value || null
                      )
                    }
                  >
                    <option value="">Team 1</option>

                    {regionTeams.map((team) => {
                      const isSelected =
                        selectedTeamIds.includes(team.id) &&
                        team.id !== game.team1_id;

                      return (
                        <option
                          key={team.id}
                          value={team.id}
                          disabled={isSelected}
                        >
                          {team.team_name}
                          {team.seed ? ` (Seed ${team.seed})` : ""}
                        </option>
                      );
                    })}
                  </select>

                  {/* Team 2 */}
                  <select
                    disabled={isReadOnlyOpeningRound}
                    className={`rounded-md border border-slate-700 p-2 text-xs ${
                      isReadOnlyOpeningRound
                        ? "cursor-not-allowed bg-slate-700 text-slate-400"
                        : "bg-slate-800"
                    }`}
                    value={game.team2_id || ""}
                    onChange={(event) =>
                      updateGame(
                        index,
                        "team2_id",
                        event.target.value || null
                      )
                    }
                  >
                    <option value="">Team 2</option>

                    {regionTeams.map((team) => {
                      const isSelected =
                        selectedTeamIds.includes(team.id) &&
                        team.id !== game.team2_id;

                      return (
                        <option
                          key={team.id}
                          value={team.id}
                          disabled={isSelected}
                        >
                          {team.team_name}
                          {team.seed ? ` (Seed ${team.seed})` : ""}
                        </option>
                      );
                    })}

                    <optgroup label="Opening Round Winners">
                      {openingRoundWinners.map((winner) => {
                        const alreadyAssignedElsewhere =
                          isOpeningWinnerAssignedElsewhere(
                            winner.id,
                            game.id
                          );

                        return (
                          <option
                            key={winner.id}
                            value={winner.id}
                            disabled={alreadyAssignedElsewhere}
                          >
                            {winner.team_name}
                            {alreadyAssignedElsewhere
                              ? " (Already assigned)"
                              : ""}
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>

                  {/* Matchup Preview */}
                  <div className="mt-2 text-xs text-slate-300">
                    <span className="font-semibold">Matchup:</span>{" "}
                    {getOpeningRoundTeamName(game.team1_id)} vs{" "}
                    {openingSource
                      ? `Winner of ${openingLabel}`
                      : regionTeams.find(
                          (team) => team.id === game.team2_id
                        )?.team_name ??
                        openingRoundWinners.find(
                          (winner) => winner.id === game.team2_id
                        )?.team_name ??
                        "TBD"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          {!isReadOnlyOpeningRound && (
            <div className="mt-8 text-center">
              <button
                type="button"
                disabled={isBusy}
                onClick={saveCurrentRound}
                className="rounded-lg bg-blue-500 px-6 py-3 font-bold text-black hover:bg-blue-400 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : `Save ${selectedRegion} • ${
                      ROUND_OPTIONS.find(
                        (round) => round.value === selectedRound
                      )?.label
                    }`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}