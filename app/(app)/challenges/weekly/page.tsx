"use client";

import { useEffect, useState } from "react";
import WeeklyThemeBanner from "@/app/trivia/weekly/WeeklyThemeBanner";
import Link from "next/link";

export default function WeeklyChallengeDetail() {
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trivia/weekly");
      const data = await res.json();

      setWeekStart(data.weekStart);
      setQuestions(data.questions);
    }
    load();
  }, []);

  return (
    <div className="space-y-10">
      <WeeklyThemeBanner />

      <section>
        <h1 className="text-3xl font-semibold mb-2">Weekly Trivia Challenge</h1>
        <p className="text-slate-400">
          {weekStart
            ? `This week's challenge started on ${weekStart}.`
            : "Loading weekly challenge…"}
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
        {questions.length ? (
          <ul className="text-slate-400 list-disc pl-6 space-y-1">
            {questions.map((q, i) => (
              <li key={i}>{q.question}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400">Loading questions…</p>
        )}
      </section>
    </div>
  );
}
