// app/admin/tournament-setup/TournamentSetupClient.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import RegionTeamForm from "./RegionTeamForm";
import {
  generateBracket,
  publishTournament,
  updateLockTime,
} from "./actions";

type Game = {
  game_id: number;
  round: number;
  region: string;
  team1: string | null;
  team2: string | null;
  source_game1: number | null;
  source_game2: number | null;
};

export default function TournamentSetupClient() {
  const [isPending, startTransition] = useTransition();
  const [games, setGames] = useState<Game[]>([]);
  const [lockTime, setLockTime] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/load-games");
      const json = await res.json();
      setGames(json.games ?? []);
    })();

    (async () => {
      const res = await fetch("/api/admin/load-settings");
      const json = await res.json();
      if (json.lock_time) {
        // Expecting ISO string; trim to "YYYY-MM-DDTHH:MM"
        const dt = json.lock_time.toString();
        const trimmed = dt.slice(0, 16);
        setLockTime(trimmed);
      }
    })();
  }, []);

  const reloadGames = async () => {
    const res = await fetch("/api/admin/load-games");
    const json = await res.json();
    setGames(json.games ?? []);
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateBracket();
      alert(result.message);
      await reloadGames();
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishTournament();
      alert(result.message);
    });
  };

  const handleSaveLock = () => {
    startTransition(async () => {
      await updateLockTime(lockTime);
      alert("Lock time updated");
    });
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "rgba(30,41,59,0.9)",
        padding: 20,
        borderRadius: 12,
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
        Tournament Builder
      </h2>

      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Enter teams by region, generate the full tournament bracket, set the
        lock time, and publish the tournament.
      </p>

      <RegionTeamForm />

      {/* Lock Time */}
      <h3 style={{ marginTop: 30, fontSize: 18, fontWeight: 700 }}>
        Tournament Lock Time
      </h3>

      <div style={{ marginTop: 10 }}>
        <input
          type="datetime-local"
          value={lockTime}
          onChange={(e) => setLockTime(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            background: "#0f172a",
            border: "1px solid rgba(148,163,184,0.35)",
            color: "white",
          }}
        />
        <button
          onClick={handleSaveLock}
          disabled={isPending}
          style={{
            marginLeft: 10,
            padding: "6px 12px",
            borderRadius: 6,
            background: "#16a34a",
            color: "white",
            border: "none",
            cursor: "pointer",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          Save Lock Time
        </button>
      </div>

      {/* Generate Button */}
      <div style={{ marginTop: 30, textAlign: "center" }}>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "#1D4ED8",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? "Generating…" : "Generate Tournament Bracket"}
        </button>
      </div>

      {/* Preview */}
      <h3 style={{ marginTop: 40, fontSize: 20, fontWeight: 700 }}>
        Bracket Preview
      </h3>

      {games.length === 0 && (
        <div style={{ opacity: 0.7 }}>No games generated yet.</div>
      )}

      {games.length > 0 && (
        <div style={{ marginTop: 20 }}>
          {games.map((g) => (
            <div
              key={g.game_id}
              style={{
                padding: 8,
                borderBottom: "1px solid rgba(148,163,184,0.25)",
                fontSize: 14,
              }}
            >
              <strong>Game {g.game_id}</strong> — Round {g.round} —{" "}
              {g.region}
              <br />
              {g.team1 || (g.source_game1 && `Winner of ${g.source_game1}`)}{" "}
              vs{" "}
              {g.team2 || (g.source_game2 && `Winner of ${g.source_game2}`)}
            </div>
          ))}
        </div>
      )}

      {/* Publish Button */}
      <div style={{ marginTop: 30, textAlign: "center" }}>
        <button
          onClick={handlePublish}
          disabled={isPending}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "#16a34a",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? "Publishing…" : "Publish Tournament"}
        </button>
      </div>
    </div>
  );
}
