"use client";

import { useEffect, useState } from "react";
import BracketClient from "./BracketClient";

export default function BracketShell({
  bracketId,
  userId,
  userEmail,
  bracketName,
}: {
  bracketId: string;
  userId: number;
  userEmail: string;
  bracketName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [bracketData, setBracketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load bracket data
  const loadBracket = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bracket?bracketId=${bracketId}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!json || json.error) {
        setError("Failed to load bracket.");
      } else {
        setBracketData(json);
      }
    } catch (err) {
      console.error("Bracket load error:", err);
      setError("Failed to load bracket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBracket();
  }, [bracketId]);

  // Save a pick
  const handlePick = async (gameId: number, teamId: string) => {
    try {
      await fetch("/api/pick", {
        method: "POST",
        body: JSON.stringify({
          bracketId,
          gameId,
          teamId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await loadBracket();
    } catch (err) {
      console.error("Pick save error:", err);
    }
  };

  // ⭐ Reset bracket picks
  const handleReset = async () => {
    try {
      await fetch("/api/bracket/reset", {
        method: "POST",
        body: JSON.stringify({ bracketId }),
        headers: { "Content-Type": "application/json" },
      });

      await loadBracket();
    } catch (err) {
      console.error("Reset bracket error:", err);
    }
  };

  if (loading) {
    return <div className="text-slate-300 text-lg">Loading bracket…</div>;
  }

  if (error || !bracketData) {
    return (
      <div className="text-red-400 text-lg">
        {error || "Failed to load bracket."}
      </div>
    );
  }

  const { bracket, picks, games } = bracketData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold mb-4">{bracketName}</h2>

      <div className="text-slate-300">
        <BracketClient
          bracket={bracket}
          picks={picks}
          games={games}
          onPick={handlePick}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
