"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Game = {
  game_id: number;
  round: number;
  region: string;
  team1: string | null;
  team2: string | null;
  seed1: number | null;
  seed2: number | null;
  source_game1: number | null;
  source_game2: number | null;
  winner: string | null;
};

export default function GamesClient() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("round", { ascending: true })
      .order("game_id", { ascending: true });

    if (error) {
      console.error("Error loading games:", error);
      setError("Failed to load games.");
      setGames([]);
      setLoading(false);
      return;
    }

    setGames((data as Game[]) ?? []);
    setLoading(false);
  };

  // ✅ NEW: Full tournament reset
  const handleReload = async () => {
    setLoading(true);
    setError(null);

    await supabase.rpc("reset_tournament");

    await fetchGames(); // refresh UI
    setLoading(false);
  };

  const setWinner = (gameId: number, winner: string | null) => {
    setGames((prev) =>
      prev.map((g) =>
        g.game_id === gameId
          ? {
              ...g,
              winner,
            }
          : g
      )
    );
  };

  const propagateWinners = (updatedGames: Game[]) => {
    const gameMap: Record<number, Game> = {};
    updatedGames.forEach((g) => (gameMap[g.game_id] = { ...g }));

    Object.values(gameMap).forEach((game) => {
      const winner = game.winner;
      if (!winner) return;

      Object.values(gameMap).forEach((nextGame) => {
        if (nextGame.source_game1 === game.game_id) {
          nextGame.team1 = winner;
        }
        if (nextGame.source_game2 === game.game_id) {
          nextGame.team2 = winner;
        }
      });
    });

    return Object.values(gameMap);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase.from("games").upsert(
        games.map((g) => ({
          game_id: g.game_id,
          winner: g.winner,
          team1: g.team1,
          team2: g.team2,
        })),
        { onConflict: "game_id" }
      );

      if (error) {
        console.error("Error saving games:", error);
        setError("Failed to save game results.");
        setSaving(false);
        return;
      }

      alert("Game results saved.");
      setSaving(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Unexpected error while saving.");
      setSaving(false);
    }
  };

  const handleSetWinnerAndPropagate = (gameId: number, winner: string) => {
    const updated = games.map((g) =>
      g.game_id === gameId ? { ...g, winner } : g
    );
    const propagated = propagateWinners(updated);
    setGames(propagated);
  };

  const groupedByRound: Record<number, Game[]> = {};
  games.forEach((g) => {
    if (!groupedByRound[g.round]) groupedByRound[g.round] = [];
    groupedByRound[g.round].push(g);
  });

  const roundKeys = Object.keys(groupedByRound)
    .map((r) => parseInt(r))
    .sort((a, b) => a - b);

  return (
    <div
      style={{
        padding: 30,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#0f172a",
        minHeight: "100vh",
        color: "#e5e7eb",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Admin · Game Results
      </h1>

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <button
          onClick={handleReload}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            cursor: loading ? "default" : "pointer",
            background: "#1D4ED8",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Resetting..." : "Reload Games"}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            cursor: saving ? "default" : "pointer",
            background: "#16A34A",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving..." : "Save Results"}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            textAlign: "center",
            color: "#fecaca",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: 20,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {roundKeys.map((round) => (
          <div
            key={round}
            style={{
              background: "rgba(15,23,42,0.96)",
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.4)",
              padding: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 10,
                borderBottom: "1px solid rgba(148,163,184,0.35)",
                paddingBottom: 6,
              }}
            >
              Round {round}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
              }}
            >
              {groupedByRound[round].map((game) => (
                <div
                  key={game.game_id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "rgba(30,41,59,0.9)",
                    border: "1px solid rgba(148,163,184,0.35)",
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        opacity: 0.9,
                      }}
                    >
                      Game {game.game_id} · {game.region}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        opacity: 0.7,
                      }}
                    >
                      src: {game.source_game1 ?? "-"} /{" "}
                      {game.source_game2 ?? "-"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <button
                      onClick={() =>
                        game.team1 &&
                        handleSetWinnerAndPropagate(game.game_id, game.team1)
                      }
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border:
                          game.winner === game.team1
                            ? "2px solid #16A34A"
                            : "1px solid rgba(148,163,184,0.4)",
                        background:
                          game.winner === game.team1
                            ? "linear-gradient(135deg,#16A34A,#15803D)"
                            : "rgba(15,23,42,0.9)",
                        color: "#e5e7eb",
                        textAlign: "left",
                        cursor: game.team1 ? "pointer" : "default",
                        opacity: game.team1 ? 1 : 0.4,
                        fontSize: 13,
                      }}
                    >
                      {game.seed1 ? `${game.seed1} ` : ""}
                      {game.team1 ?? "TBD"}
                    </button>

                    <button
                      onClick={() =>
                        game.team2 &&
                        handleSetWinnerAndPropagate(game.game_id, game.team2)
                      }
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border:
                          game.winner === game.team2
                            ? "2px solid #16A34A"
                            : "1px solid rgba(148,163,184,0.4)",
                        background:
                          game.winner === game.team2
                            ? "linear-gradient(135deg,#16A34A,#15803D)"
                            : "rgba(15,23,42,0.9)",
                        color: "#e5e7eb",
                        textAlign: "left",
                        cursor: game.team2 ? "pointer" : "default",
                        opacity: game.team2 ? 1 : 0.4,
                        fontSize: 13,
                      }}
                    >
                      {game.seed2 ? `${game.seed2} ` : ""}
                      {game.team2 ?? "TBD"}
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      opacity: 0.8,
                    }}
                  >
                    Winner:{" "}
                    <strong>{game.winner ? game.winner : "Not set"}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {roundKeys.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              opacity: 0.8,
              marginTop: 40,
            }}
          >
            No games found.
          </div>
        )}
      </div>
    </div>
  );
}
