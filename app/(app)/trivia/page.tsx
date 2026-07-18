"use client";

import DailyChallenge from "../../trivia/components/DailyChallenge";
import WeeklyChallenge from "../../trivia/components/WeeklyChallenge";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TriviaHub() {
  const [displayName, setDisplayName] = useState<string>("Player");

  useEffect(() => {
    // Load display name from local storage or fallback
    const stored = localStorage.getItem("displayName");
    if (stored) setDisplayName(stored);
  }, []);

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
        color: "#e5e7eb",
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 16,
          color: "#f3f4f6",
        }}
      >
        Trivia Hub
      </h1>

      <p style={{ marginBottom: 24, color: "#94a3b8" }}>
        Welcome back, {displayName}. Ready to test your knowledge?
      </p>

      {/* Daily Challenge */}
      <DailyChallenge displayName={displayName} />

      {/* Weekly Challenge */}
      <WeeklyChallenge displayName={displayName} />

      {/* Trivia Modes */}
      <div
        style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 16,
          background: "rgba(15,23,42,0.95)",
          border: "1px solid #1f2937",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          Trivia Modes
        </h2>

        <ul className="space-y-3">
          <li>
            <Link
              href="/trivia/mode/classic"
              className="text-blue-400 hover:text-blue-300"
            >
              Classic Mode
            </Link>
          </li>
          <li>
            <Link
              href="/trivia/mode/speed"
              className="text-blue-400 hover:text-blue-300"
            >
              Speed Mode
            </Link>
          </li>
          <li>
            <Link
              href="/trivia/mode/survival"
              className="text-blue-400 hover:text-blue-300"
            >
              Survival Mode
            </Link>
          </li>
        </ul>
      </div>

      {/* Hall of Fame / Leaderboard */}
      <div
        style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 16,
          background: "rgba(15,23,42,0.95)",
          border: "1px solid #1f2937",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          Hall of Fame & Leaderboard
        </h2>

        <ul className="space-y-3">
          <li>
            <Link
              href="/trivia/hof"
              className="text-blue-400 hover:text-blue-300"
            >
              Hall of Fame
            </Link>
          </li>
          <li>
            <Link
              href="/trivia/leaderboard"
              className="text-blue-400 hover:text-blue-300"
            >
              Leaderboard
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
