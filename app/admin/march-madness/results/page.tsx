
"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Team = {
  id: string;
  team_name: string;
  seed: number | null;
  true_seed?: number | null;
  region: string | null;
};

type TournamentGame = {
  id: string;
  game_number: number;
  round: number;
  region: string | null;
  team1_id: string | null;
  team2_id: string | null;
  home_score: number | null;
  away_score: number | null;
  winner: string | null;
  status: string | null;
  completed: boolean | null;
  winner_to_game_id: string | null;
};

type GameScores = {
  team1_score: string;
  team2_score: string;
};

// A game is official only when it has a final status,
// is marked completed, and has a valid decisive score.
function isOfficialFinal(game: TournamentGame): boolean {
  return (
    game.completed === true &&
    game.status?.toLowerCase() === "final" &&
    game.home_score !== null &&
    game.home_score !== undefined &&
    game.away_score !== null &&
    game.away_score !== undefined &&
    game.home_score !== game.away_score
  );
}

const ROUND_NAMES: Record<number, string> = {
  0: "Opening Round",
  1: "Round of 64",
  2: "Round of 32",
  3: "Sweet 16",
  4: "Elite Eight",
  5: "Final Four",
  6: "Championship",
};

const ROUNDS = [0, 1, 2, 3, 4, 5, 6];

export default function MarchMadnessResultsPage() {
  const [supabase] = useState(() => createSupabaseBrowserClient());

  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<TournamentGame[]>([]);
  const [scores, setScores] = useState<Record<string, GameScores>>({});

  const [activeRound, setActiveRound] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingGameId, setSavingGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [teamResult, gameResult] = await Promise.all([
          supabase
            .from("tournament_teams")
            .select("id, team_name, seed, true_seed, region")
            .order("team_name", { ascending: true }),

          supabase
            .from("tournament_games")
            .select(
              "id, game_number, round, region, team1_id, team2_id, home_score, away_score, winner, status, completed, winner_to_game_id"
            )
            .is("bracket_id", null)
            .order("round", { ascending: true })
            .order("game_number", { ascending: true }),
        ]);

        if (teamResult.error) throw teamResult.error;
        if (gameResult.error) throw gameResult.error;

        const loadedTeams = (teamResult.data || []) as Team[];
        const loadedGames = (gameResult.data || []) as TournamentGame[];

        setTeams(loadedTeams);
        setGames(loadedGames);

        const initialScores: Record<string, GameScores> = {};

        loadedGames.forEach((game) => {
          const final = isOfficialFinal(game);

          initialScores[game.id] = {
            team1_score:
              final && game.home_score !== null
                ? String(game.home_score)
                : "",
            team2_score:
              final && game.away_score !== null
                ? String(game.away_score)
                : "",
          };
        });

        setScores(initialScores);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load tournament games."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [supabase]);

  const teamLookup = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams]
  );

  const visibleGames = useMemo(
    () => games.filter((game) => game.round === activeRound),
    [games, activeRound]
  );

  function teamName(teamId: string | null) {
    if (!teamId) return "TBD";

    if (teamId.startsWith("opening-")) {
      return "Opening Round Winner";
    }

    return teamLookup.get(teamId)?.team_name || "Unknown Team";
  }

  function teamSeed(teamId: string | null) {
    if (!teamId || teamId.startsWith("opening-")) return null;

    const team = teamLookup.get(teamId);
    return team?.seed ?? team?.true_seed ?? null;
  }

  function updateScore(
    gameId: string,
    field: keyof GameScores,
    value: string
  ) {
    setScores((previous) => ({
      ...previous,
      [gameId]: {
        team1_score: previous[gameId]?.team1_score ?? "",
        team2_score: previous[gameId]?.team2_score ?? "",
        [field]: value,
      },
    }));

    setNotice(null);
    setError(null);
  }

  async function saveResult(game: TournamentGame) {
    const gameScores = scores[game.id];

    if (
      !gameScores ||
      gameScores.team1_score.trim() === "" ||
      gameScores.team2_score.trim() === ""
    ) {
      setError("Enter both teams' scores before saving.");
      return;
    }

    const team1Score = Number(gameScores.team1_score);
    const team2Score = Number(gameScores.team2_score);

    if (
      !Number.isInteger(team1Score) ||
      !Number.isInteger(team2Score) ||
      team1Score < 0 ||
      team2Score < 0
    ) {
      setError("Scores must be nonnegative whole numbers.");
      return;
    }

    if (team1Score === team2Score) {
      setError(
        "The final score cannot be tied. Enter the score after overtime."
      );
      return;
    }

    setSavingGameId(game.id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        "/api/march-madness-v2/admin/results",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            game_id: game.id,
            team1_score: team1Score,
            team2_score: team2Score,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to save this game result."
        );
      }

      setGames((previous) =>
        previous.map((item) => {
          if (item.id === game.id) {
            return {
              ...item,
              home_score: team1Score,
              away_score: team2Score,
              winner: result.winner_team_id,
              completed: true,
              status: "final",
            };
          }

          if (
            result.advanced_to_game_id &&
            item.id === result.advanced_to_game_id &&
            result.advanced_slot
          ) {
            return {
              ...item,
              [result.advanced_slot]: result.winner_team_id,
            };
          }

          return item;
        })
      );

      setNotice(
        `${teamName(result.winner_team_id)} won ${team1Score}–${team2Score}.` +
          (result.advanced_to_game_id
            ? " Winner advanced to the next round."
            : " Championship result saved.")
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save game result."
      );
    } finally {
      setSavingGameId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => window.history.back()}
              className="mb-3 text-sm text-slate-400 hover:text-white"
            >
              ← Back to Admin
            </button>

            <h1 className="text-3xl font-extrabold text-yellow-400">
              Game Results & Scores
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Enter final scores. Winners are calculated automatically
              and advanced through the tournament.
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm">
            <span className="text-slate-400">Games loaded: </span>
            <strong>{games.length}</strong>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {ROUNDS.map((round) => (
            <button
              key={round}
              onClick={() => {
                setActiveRound(round);
                setError(null);
                setNotice(null);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                activeRound === round
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {ROUND_NAMES[round]}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-700 bg-red-950 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-lg border border-green-700 bg-green-950 p-4 text-sm text-green-200">
            {notice}
          </div>
        )}

        {loading && (
          <p className="py-12 text-center text-slate-400">
            Loading tournament games...
          </p>
        )}

        {!loading && visibleGames.length === 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-bold">
              No {ROUND_NAMES[activeRound]} games found
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Check that the tournament has been initialized and the
              bracket matchups have been saved.
            </p>
          </div>
        )}

        {!loading && visibleGames.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleGames.map((game) => {
              const gameScores = scores[game.id] || {
                team1_score: "",
                team2_score: "",
              };

              const team1 = teamName(game.team1_id);
              const team2 = teamName(game.team2_id);

              const isFinal = isOfficialFinal(game);

              const winnerName =
                isFinal && game.winner
                  ? teamName(game.winner)
                  : null;

              const ready =
                Boolean(game.team1_id) &&
                Boolean(game.team2_id) &&
                !game.team1_id?.startsWith("opening-") &&
                !game.team2_id?.startsWith("opening-");

              return (
                <div
                  key={game.id}
                  className="rounded-xl border border-slate-700 bg-slate-900 p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-yellow-300">
                        Game #{game.game_number}
                      </h2>
                      {game.region && (
                        <p className="text-xs text-slate-400">
                          {game.region}
                        </p>
                      )}
                    </div>

                    {isFinal ? (
                      <span className="rounded-full border border-green-700 bg-green-950 px-3 py-1 text-xs font-bold text-green-300">
                        FINAL
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                        NOT FINAL
                      </span>
                    )}
                  </div>

                  <div className="mb-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {team1}
                      </p>
                      {teamSeed(game.team1_id) !== null && (
                        <p className="text-xs text-slate-400">
                          Seed {teamSeed(game.team1_id)}
                        </p>
                      )}
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      aria-label={`${team1} score`}
                      disabled={!ready || savingGameId === game.id}
                      value={gameScores.team1_score}
                      onChange={(event) =>
                        updateScore(
                          game.id,
                          "team1_score",
                          event.target.value
                        )
                      }
                      placeholder="Score"
                      className="w-20 rounded-lg border border-slate-600 bg-slate-800 p-2 text-center text-lg font-bold text-white outline-none focus:border-yellow-400 disabled:opacity-50"
                    />
                  </div>

                  <div className="mb-4 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {team2}
                      </p>
                      {teamSeed(game.team2_id) !== null && (
                        <p className="text-xs text-slate-400">
                          Seed {teamSeed(game.team2_id)}
                        </p>
                      )}
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      aria-label={`${team2} score`}
                      disabled={!ready || savingGameId === game.id}
                      value={gameScores.team2_score}
                      onChange={(event) =>
                        updateScore(
                          game.id,
                          "team2_score",
                          event.target.value
                        )
                      }
                      placeholder="Score"
                      className="w-20 rounded-lg border border-slate-600 bg-slate-800 p-2 text-center text-lg font-bold text-white outline-none focus:border-yellow-400 disabled:opacity-50"
                    />
                  </div>

                  {winnerName && (
                    <div className="mb-4 rounded-lg bg-slate-800 px-3 py-2 text-sm">
                      <span className="text-slate-400">
                        Official winner:{" "}
                      </span>
                      <strong className="text-green-300">
                        {winnerName}
                      </strong>
                    </div>
                  )}

                  {!isFinal && game.winner && (
                    <div className="mb-4 rounded-lg border border-amber-700 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
                      A previous winner is recorded, but this game does
                      not have a valid final result. No official winner
                      is being displayed.
                    </div>
                  )}

                  {!ready && (
                    <p className="mb-3 text-xs text-amber-300">
                      Waiting for both teams to be determined.
                    </p>
                  )}

                  <button
                    onClick={() => saveResult(game)}
                    disabled={!ready || savingGameId !== null}
                    className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {savingGameId === game.id
                      ? "Saving Result..."
                      : isFinal
                        ? "Update Final Score"
                        : "Save Final Score"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
