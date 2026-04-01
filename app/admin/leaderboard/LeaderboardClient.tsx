"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function LeaderboardClient() {
  const [loading, setLoading] = useState(false);

  const run = async (label: string, fn: () => Promise<void>) => {
    if (!confirm(`Run: ${label}?`)) return;
    setLoading(true);
    try {
      await fn();
      alert(`${label} completed.`);
    } catch (err) {
      console.error(err);
      alert(`Error running: ${label}`);
    }
    setLoading(false);
  };

  // -------------------------------------------------------
  // 1. RECALCULATE SCORES
  // -------------------------------------------------------
  const recalcScores = async () => {
    // Load all games with winners
    const { data: games } = await supabase
      .from("games")
      .select("game_id, round, winner");

    if (!games) return;

    // Load all picks
    const { data: picks } = await supabase
      .from("picks")
      .select("bracket_id, game_id, selected_team");

    if (!picks) return;

    // Scoring system
    const roundPoints: Record<number, number> = {
      1: 1,
      2: 2,
      3: 4,
      4: 8,
      5: 16,
      6: 32,
    };

    const scoreMap: Record<number, number> = {};

    picks.forEach((p) => {
      const game = games.find((g) => g.game_id === p.game_id);
      if (!game || !game.winner) return;

      if (p.selected_team === game.winner) {
        const pts = roundPoints[game.round] ?? 0;
        scoreMap[p.bracket_id] = (scoreMap[p.bracket_id] ?? 0) + pts;
      }
    });

    // Save scores
    const rows = Object.entries(scoreMap).map(([bracketId, score]) => ({
      bracket_id: Number(bracketId),
      score,
    }));

    await supabase.from("leaderboard").upsert(rows, {
      onConflict: "bracket_id",
    });
  };

  // -------------------------------------------------------
  // 2. RECALCULATE MULLIGAN STARS
  // -------------------------------------------------------
  const recalcMulliganStars = async () => {
    const { data: mulligans } = await supabase
      .from("mulligan_requests")
      .select("bracket_id, status");

    if (!mulligans) return;

    const starMap: Record<number, number> = {};

    mulligans.forEach((m) => {
      if (m.status === "approved") {
        starMap[m.bracket_id] = (starMap[m.bracket_id] ?? 0) + 1;
      }
    });

    const rows = Object.entries(starMap).map(([bracketId, stars]) => ({
      bracket_id: Number(bracketId),
      mulligan_stars: stars,
    }));

    await supabase.from("leaderboard").upsert(rows, {
      onConflict: "bracket_id",
    });
  };

  // -------------------------------------------------------
  // 3. RECALCULATE RANK CHANGES
  // -------------------------------------------------------
  const recalcRankChanges = async () => {
    const { data: rows } = await supabase
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false });

    if (!rows) return;

    const updates = rows.map((row, index) => ({
      bracket_id: row.bracket_id,
      previous_rank: row.current_rank ?? null,
      current_rank: index + 1,
    }));

    await supabase.from("leaderboard").upsert(updates, {
      onConflict: "bracket_id",
    });
  };

  // -------------------------------------------------------
  // 4. RECALCULATE TIEBREAKERS
  // -------------------------------------------------------
  const recalcTiebreakers = async () => {
    const { data: submissions } = await supabase
      .from("bracket_submissions")
      .select("bracket_id, tiebreaker");

    if (!submissions) return;

    const rows = submissions.map((s) => ({
      bracket_id: s.bracket_id,
      tiebreaker: s.tiebreaker,
    }));

    await supabase.from("leaderboard").upsert(rows, {
      onConflict: "bracket_id",
    });
  };

  // -------------------------------------------------------
  // 5. FULL REBUILD
  // -------------------------------------------------------
  const rebuildLeaderboard = async () => {
    await recalcScores();
    await recalcMulliganStars();
    await recalcTiebreakers();
    await recalcRankChanges();
  };

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
        Admin · Leaderboard Tools
      </h1>

      {loading && (
        <div style={{ textAlign: "center", opacity: 0.8 }}>
          Running leaderboard task…
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: 20,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* SCORE RECALC */}
        <Section title="Recalculate Scores">
          <button
            onClick={() => run("Recalculate Scores", recalcScores)}
            style={btn("#1D4ED8")}
          >
            Recalculate Scores
          </button>
        </Section>

        {/* MULLIGAN STARS */}
        <Section title="Recalculate Mulligan Stars">
          <button
            onClick={() =>
              run("Recalculate Mulligan Stars", recalcMulliganStars)
            }
            style={btn("#9333EA")}
          >
            Recalculate Mulligan Stars
          </button>
        </Section>

        {/* RANK CHANGES */}
        <Section title="Recalculate Rank Changes">
          <button
            onClick={() => run("Recalculate Rank Changes", recalcRankChanges)}
            style={btn("#16A34A")}
          >
            Recalculate Rank Changes
          </button>
        </Section>

        {/* TIEBREAKERS */}
        <Section title="Recalculate Tiebreakers">
          <button
            onClick={() => run("Recalculate Tiebreakers", recalcTiebreakers)}
            style={btn("#64748b")}
          >
            Recalculate Tiebreakers
          </button>
        </Section>

        {/* FULL REBUILD */}
        <Section title="Full Leaderboard Rebuild">
          <button
            onClick={() => run("Full Leaderboard Rebuild", rebuildLeaderboard)}
            style={btn("#dc2626")}
          >
            Rebuild Leaderboard
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(30,41,59,0.9)",
        borderRadius: 12,
        border: "1px solid rgba(148,163,184,0.35)",
        padding: 16,
        boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function btn(color: string): React.CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: color,
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
  };
}
