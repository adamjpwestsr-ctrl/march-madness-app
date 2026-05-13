// app/admin/bracket-admin/BracketAdminClient.tsx
"use client";

import { useState } from "react";
import { advanceWinner, updateBracketScores } from "../tournament-setup/actions";

type Game = {
  game_id: number;
  round: number;
  region: string | null;
  team1: string | null;
  team2: string | null;
  winner: string | null;
  source_game1: number | null;
  source_game2: number | null;
  is_placeholder?: boolean | null;
};

const ROUND_LABELS: Record<number, string> = {
  0: "Opening Round",
  1: "Round of 64",
  2: "Round of 32",
  3: "Sweet 16",
  4: "Elite 8",
  5: "Final Four",
  6: "Championship",
};

export default function BracketAdminClient({ games }: { games: Game[] }) {
  const [localGames, setLocalGames] = useState<Game[]>(games);
  const [loadingGameId, setLoadingGameId] = useState<number | null>(null);

  const handleSetWinner = async (gameId: number, winnerTeam: string) => {
    try {
      setLoadingGameId(gameId);

      // Step 5: advance winner through bracket
      await advanceWinner(gameId, winnerTeam);

      // Step 6: refresh scores (optional but recommended)
      await updateBracketScores();

      // Optimistic local update so UI reflects change immediately
      setLocalGames((prev) =>
        prev.map((g) =>
          g.game_id === gameId ? { ...g, winner: winnerTeam } : g
        )
      );

      alert(`Winner set for Game ${gameId}: ${winnerTeam}`);
    } catch (err) {
      console.error(err);
      alert("Failed to set winner.");
    } finally {
      setLoadingGameId(null);
    }
  };

  const gamesByRound = localGames.reduce<Record<number, Game[]>>((acc, g) => {
    if (!acc[g.round]) acc[g.round] = [];
    acc[g.round].push(g);
    return acc;
  }, {});

  return (
    <div
      style={{
        padding: 30,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#020617",
        minHeight: "100vh",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>
        Bracket Admin — Set Winners
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Click a team to set the winner for a game. Winners will automatically advance
        and scores will update via your scoring views.
      </p>

      {Object.keys(gamesByRound)
        .map((r) => Number(r))
        .sort((a, b) => a - b)
        .map((round) => (
          <div key={round} style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>
              {ROUND_LABELS[round] ?? `Round ${round}`}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 10,
              }}
            >
              {gamesByRound[round].map((g) => (
                <div
                  key={g.game_id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "#020617",
                    border: "1px solid #1f2937",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      opacity: 0.8,
                    }}
                  >
                    <span>
                      Game {g.game_id} — {g.region}
                    </span>
                    <span>
                      Winner:{" "}
                      {g.winner ? (
                        <strong>{g.winner}</strong>
                      ) : (
                        <span style={{ opacity: 0.7 }}>Not set</span>
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "stretch",
                    }}
                  >
                    {/* TEAM 1 */}
                    <TeamCard
                      label="Team 1"
                      team={g.team1}
                      isWinner={g.winner === g.team1}
                      disabled={!g.team1 || loadingGameId === g.game_id}
                      onClick={() =>
                        g.team1 && handleSetWinner(g.game_id, g.team1)
                      }
                    />

                    {/* TEAM 2 */}
                    <TeamCard
                      label="Team 2"
                      team={g.team2}
                      isWinner={g.winner === g.team2}
                      disabled={!g.team2 || loadingGameId === g.game_id}
                      onClick={() =>
                        g.team2 && handleSetWinner(g.game_id, g.team2)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function TeamCard({
  label,
  team,
  isWinner,
  disabled,
  onClick,
}: {
  label: string;
  team: string | null;
  isWinner: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const bg = !team
    ? "rgba(15,23,42,0.7)"
    : isWinner
    ? "rgba(22,163,74,0.25)"
    : "rgba(15,23,42,0.9)";

  const border = isWinner ? "#22c55e" : "#1f2937";

  return (
    <button
      onClick={onClick}
      disabled={disabled || !team}
      style={{
        flex: 1,
        textAlign: "left",
        padding: 10,
        borderRadius: 8,
        border: `1px solid ${border}`,
        background: bg,
        color: "#e5e7eb",
        cursor: disabled || !team ? "not-allowed" : "pointer",
        opacity: disabled || !team ? 0.5 : 1,
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        {team || "TBD"}
      </div>
      {isWinner && (
        <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4 }}>
          Winner
        </div>
      )}
    </button>
  );
}
