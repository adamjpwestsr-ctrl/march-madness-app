"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

export default function ToolsClient() {
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

  // -----------------------------
  // BRACKET GENERATORS
  // -----------------------------

  const generateChalkBracket = async () => {
    const { data: games } = await supabase.from("games").select("*");
    if (!games) return;

    const picks = games.map((g) => {
      if (!g.team1 || !g.team2) return null;

      const winner =
        (g.seed1 ?? 99) < (g.seed2 ?? 99) ? g.team1 : g.team2;

      return {
        bracket_id: 999001,
        game_id: g.game_id,
        selected_team: winner,
      };
    });

    await supabase.from("picks").upsert(
      picks.filter(Boolean) as any[],
      { onConflict: "bracket_id,game_id" }
    );
  };

  const generateUpsetBracket = async () => {
    const { data: games } = await supabase.from("games").select("*");
    if (!games) return;

    const picks = games.map((g) => {
      if (!g.team1 || !g.team2) return null;

      const winner =
        (g.seed1 ?? 99) > (g.seed2 ?? 99) ? g.team1 : g.team2;

      return {
        bracket_id: 999002,
        game_id: g.game_id,
        selected_team: winner,
      };
    });

    await supabase.from("picks").upsert(
      picks.filter(Boolean) as any[],
      { onConflict: "bracket_id,game_id" }
    );
  };

  const generatePerfectBracket = async () => {
    const { data: games } = await supabase.from("games").select("*");
    if (!games) return;

    const picks = games
      .filter((g) => g.winner)
      .map((g) => ({
        bracket_id: 999003,
        game_id: g.game_id,
        selected_team: g.winner,
      }));

    await supabase.from("picks").upsert(picks, {
      onConflict: "bracket_id,game_id",
    });
  };

  // -----------------------------
  // SIMULATION TOOLS
  // -----------------------------

  const simulateRound = async (round: number) => {
    const { data: games } = await supabase
      .from("games")
      .select("*")
      .eq("round", round);

    if (!games) return;

    const updates = games.map((g) => {
      if (!g.team1 || !g.team2) return null;

      const winner = Math.random() < 0.5 ? g.team1 : g.team2;

      return {
        game_id: g.game_id,
        winner,
      };
    });

    await supabase.from("games").upsert(
      updates.filter(Boolean) as any[],
      { onConflict: "game_id" }
    );
  };

  // -----------------------------
  // RESET TOOLS
  // -----------------------------

  const resetTournament = async () => {
    await supabase.from("games").update({ winner: null });
    await supabase.from("picks").delete().neq("bracket_id", -1);
    await supabase.from("bracket_submissions").delete().neq("bracket_id", -1);
    await supabase.from("mulligan_requests").delete().neq("id", -1);
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
        Admin · Tools & Simulations
      </h1>

      {loading && (
        <div style={{ textAlign: "center", opacity: 0.8 }}>
          Running tool…
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
        {/* BRACKET GENERATORS */}
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
            Bracket Generators
          </h2>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => run("Generate Chalk Bracket", generateChalkBracket)}
              style={btn("#1D4ED8")}
            >
              Chalk Bracket
            </button>

            <button
              onClick={() => run("Generate Upset Bracket", generateUpsetBracket)}
              style={btn("#9333EA")}
            >
              Upset Bracket
            </button>

            <button
              onClick={() =>
                run("Generate Perfect Bracket", generatePerfectBracket)
              }
              style={btn("#16A34A")}
            >
              Perfect Bracket
            </button>
          </div>
        </div>

        {/* SIMULATION */}
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
            Simulate Rounds
          </h2>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5, 6].map((round) => (
              <button
                key={round}
                onClick={() =>
                  run(`Simulate Round ${round}`, () => simulateRound(round))
                }
                style={btn("#64748b")}
              >
                Round {round}
              </button>
            ))}
          </div>
        </div>

        {/* RESET */}
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
            Reset Tools
          </h2>

          <button
            onClick={() => run("Reset Tournament", resetTournament)}
            style={btn("#dc2626")}
          >
            Reset Tournament
          </button>
        </div>

        {/* ⭐ NEW: LOCK DATE SETTINGS */}
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
            Lock Date Settings
          </h2>

          <Link
            href="/admin/tools/lock-date"
            style={{
              ...btn("#2563eb"),
              display: "inline-block",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Open Lock Date Editor
          </Link>
        </div>
      </div>
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
