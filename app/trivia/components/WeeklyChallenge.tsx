"use client";

import { useEffect, useState } from "react";

export default function WeeklyChallenge({
  displayName,
}: {
  displayName: string;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/trivia/weekly", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        if (!data.questions || data.questions.length === 0) {
          setError("Weekly challenge unavailable");
          setLoading(false);
          return;
        }

        setQuestions(data.questions);
        setWeekStart(data.weekStart ?? null);
        setTheme(data.theme ?? null);
        setLoading(false);
      } catch (err) {
        if (active) {
          setError("Failed to load weekly challenge");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // 🔒 Hydration-safe: render nothing until loading completes
  if (loading) {
    return (
      <div className="text-slate-400 p-6">
        Loading weekly challenge…
      </div>
    );
  }

  // 🔒 Hydration-safe: render nothing if API failed
  if (error) {
    return (
      <div className="p-6 text-slate-400">
        Weekly challenge unavailable — {error}.
      </div>
    );
  }

  // 🔒 Hydration-safe: render nothing if questions missing
  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-slate-400">
        Weekly challenge unavailable.
      </div>
    );
  }

  // 🟢 Valid weekly challenge — safe to render full UI
  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        borderRadius: 16,
        background: "rgba(15,23,42,0.95)",
        border: "1px solid #1f2937",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        Weekly Challenge
      </h2>

      <p style={{ marginBottom: 12, color: "#e5e7eb" }}>
        Week of {weekStart} — Good luck, {displayName}.
      </p>

      {theme && (
        <p style={{ marginBottom: 12, color: "#93c5fd" }}>
          Theme: {theme}
        </p>
      )}

      <ul className="space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            className="p-3 rounded-lg bg-slate-800/40 border border-slate-700"
          >
            <p className="font-medium">{q.question}</p>
            <p className="text-slate-400 text-sm">
              Difficulty: {q.difficulty} • {q.points} pts
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
