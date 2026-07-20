"use client";

import { useEffect, useState } from "react";
import WeeklyThemeBanner from "@/app/trivia/weekly/WeeklyThemeBanner";
import Link from "next/link";

export default function WeeklyChallengeDetail() {
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/trivia/weekly", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        // Defensive guards for all possible API shapes
        if (!data || data.error) {
          setError(data?.error ?? "Weekly challenge unavailable");
          setWeekStart(null);
          setQuestions([]);
          setLoading(false);
          return;
        }

        // Ensure weekStart is valid
        if (!data.weekStart || typeof data.weekStart !== "string") {
          setError("Invalid weekly challenge data");
          setWeekStart(null);
          setQuestions([]);
          setLoading(false);
          return;
        }

        // Ensure questions is an array
        const safeQuestions = Array.isArray(data.questions)
          ? data.questions
          : [];

        setWeekStart(data.weekStart);
        setQuestions(safeQuestions);
        setLoading(false);
      } catch (err) {
        if (active) {
          setError("Failed to load weekly challenge");
          setWeekStart(null);
          setQuestions([]);
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
        Weekly challenge unavailable.
      </div>
    );
  }

  // 🔒 Hydration-safe: render nothing if no questions
  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-slate-400">
        Weekly challenge will appear once trivia questions are available.
      </div>
    );
  }

  // 🟢 Valid weekly challenge — safe to render full UI
  return (
    <div className="space-y-10 p-6">
      <WeeklyThemeBanner weekStart={weekStart!} />

      <section>
        <h1 className="text-3xl font-semibold mb-2">Weekly Trivia Challenge</h1>
        <p className="text-slate-400">
          This week's challenge started on {weekStart}.
        </p>
      </section>

      <section>
        <Link
          href="/trivia/game?mode=weekly"
          className="inline-block px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          Start Weekly Challenge
        </Link>
      </section>

      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">Questions Preview</h2>
        <ul className="text-slate-400 list-disc pl-6 space-y-1">
          {questions.map((q, i) => (
            <li key={i}>{q.question ?? "Untitled question"}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
