"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Team = {
  id: string;
  team_name: string;
  seed: number | null;
  region: string | null;
  true_seed?: number | null;
};

type OpeningGame = {
  id?: string;
  game_number: number;
  team1_id: string | null;
  team2_id: string | null;
};

export default function AdminOpeningRoundPage() {
  const supabase = createSupabaseBrowserClient();

  const [openingTeams, setOpeningTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<OpeningGame[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from("tournament_teams")
          .select("id, team_name, seed, region, true_seed")
          .is("region", null)
          .order("true_seed", { ascending: true });

        if (teamError) throw teamError;

        const { data: gameData, error: gameError } = await supabase
          .from("tournament_games")
          .select("id, game_number, team1_id, team2_id")
          .eq("round", 0)
          .is("bracket_id", null)
          .order("game_number", { ascending: true });

        if (gameError) throw gameError;

        setOpeningTeams(teamData || []);

        setGames(
          gameData?.length
            ? gameData.map((game) => ({
                id: game.id,
                game_number: game.game_number,
                team1_id: game.team1_id,
                team2_id: game.team2_id,
              }))
            : Array.from({ length: 12 }, (_, index) => ({
                game_number: index + 1,
                team1_id: null,
                team2_id: null,
              }))
        );
      } catch (error) {
        alert(
          "Error loading Opening Round: " +
            (error instanceof Error
              ? error.message
              : "Could not load data.")
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
    // Load once when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateGame(
    index: number,
    field: "team1_id" | "team2_id",
    value: string | null
  ) {
    setGames((previous) =>
      previous.map((game, gameIndex) =>
        gameIndex === index
          ? { ...game, [field]: value }
          : game
      )
    );
  }

  async function saveMatchups() {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/opening-round/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ games }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert("Error: " + (result.error || "Request failed"));
        return;
      }

      alert(
        "Opening Round matchups saved! Existing Round-of-64 advancement links were preserved."
      );
    } catch (error) {
      alert(
        "Error saving matchups: " +
          (error instanceof Error
            ? error.message
            : "Request failed")
      );
    } finally {
      setSaving(false);
    }
  }

  async function setWinner(
    game: OpeningGame,
    winnerId: string
  ) {
    setSaving(true);

    try {
      const response = await fetch(
        "/api/march-madness-v2/admin/opening-round/set-winner",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            game_number: game.game_number,
            winner_team_id: winnerId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert("Error: " + (result.error || "Request failed"));
        return;
      }

      alert("Official winner saved and advanced.");
    } catch (error) {
      alert(
        "Error setting winner: " +
          (error instanceof Error
            ? error.message
            : "Request failed")
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedIds = games.flatMap((game) => [
    game.team1_id,
    game.team2_id,
  ]).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <h1 className="mb-6 text-3xl font-extrabold text-yellow-400">
        Admin • Opening Round Matchups
      </h1>

      {loading && (
        <p className="text-slate-400">Loading teams…</p>
      )}

      {!loading && (
        <>
          <p className="mb-5 text-sm text-slate-300">
            Configure the 12 Opening Round matchups here.
            Assign each Opening Round winner&apos;s Round-of-64
            destination in the Full Bracket Editor.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game, index) => (
              <div
                key={game.game_number}
                className="flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900 p-4"
              >
                <h2 className="text-lg font-bold text-yellow-300">
                  Game #{game.game_number}
                </h2>

                <select
                  aria-label={`Game ${game.game_number} Team 1`}
                  className="rounded-md border border-slate-700 bg-slate-800 p-2 text-sm"
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

                  {openingTeams.map((team) => {
                    const usedElsewhere =
                      selectedIds.includes(team.id) &&
                      game.team1_id !== team.id;

                    const sameGameOtherSlot =
                      game.team2_id === team.id;

                    return (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={
                          usedElsewhere || sameGameOtherSlot
                        }
                      >
                        {team.team_name} (Seed{" "}
                        {team.seed ?? team.true_seed ?? "—"})
                      </option>
                    );
                  })}
                </select>

                <select
                  aria-label={`Game ${game.game_number} Team 2`}
                  className="rounded-md border border-slate-700 bg-slate-800 p-2 text-sm"
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

                  {openingTeams.map((team) => {
                    const usedElsewhere =
                      selectedIds.includes(team.id) &&
                      game.team2_id !== team.id;

                    const sameGameOtherSlot =
                      game.team1_id === team.id;

                    return (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={
                          usedElsewhere || sameGameOtherSlot
                        }
                      >
                        {team.team_name} (Seed{" "}
                        {team.seed ?? team.true_seed ?? "—"})
                      </option>
                    );
                  })}
                </select>

                <div className="mt-2 flex justify-between gap-2">
                  <button
                    disabled={saving || !game.team1_id}
                    onClick={() =>
                      setWinner(game, game.team1_id!)
                    }
                    className="rounded-md bg-green-500 px-3 py-1 text-xs font-bold text-black hover:bg-green-400 disabled:opacity-50"
                  >
                    Set{" "}
                    {openingTeams.find(
                      (team) => team.id === game.team1_id
                    )?.team_name || "Team 1"}{" "}
                    Winner
                  </button>

                  <button
                    disabled={saving || !game.team2_id}
                    onClick={() =>
                      setWinner(game, game.team2_id!)
                    }
                    className="rounded-md bg-green-500 px-3 py-1 text-xs font-bold text-black hover:bg-green-400 disabled:opacity-50"
                  >
                    Set{" "}
                    {openingTeams.find(
                      (team) => team.id === game.team2_id
                    )?.team_name || "Team 2"}{" "}
                    Winner
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              disabled={saving}
              onClick={saveMatchups}
              className="rounded-lg bg-blue-500 px-6 py-3 font-bold text-black hover:bg-blue-400 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save All Matchups"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}