"use client";

import { useState } from "react";

export default function WeeklyChallenge({
  displayName,
  weekStart,
  weeklyQuestions,
  onStartWeekly,
}: {
  displayName: string;
  weekStart: string | null;
  weeklyQuestions: any[] | null;
  onStartWeekly?: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [passed, setPassed] = useState(0);
  const [finished, setFinished] = useState(false);

  const startChallenge = () => {
    setStarted(true);
    setIndex(0);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setPassed(0);
    setFinished(false);
    setAnswer("");
    onStartWeekly?.();
  };

  // 🟡 Loading or empty state
  if (!weeklyQuestions || weeklyQuestions.length === 0) {
    return (
      <div className="text-center mt-6">
        <h2 className="text-xl font-bold mb-2">Weekly Challenge</h2>
        <p className="text-slate-400">
          Weekly challenge will appear once trivia questions are available.
        </p>
      </div>
    );
  }

  // 🟢 Before starting
  if (!started) {
    return (
      <div className="text-center mt-6">
        <h2 className="text-xl font-bold mb-2">
          Weekly Challenge — {weekStart ?? "Unknown Week"}
        </h2>
        <p className="text-slate-400 mb-4">
          Ready to test your knowledge in this week’s themed round?
        </p>
        <button
          onClick={startChallenge}
          className="px-5 py-2 rounded-full bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-600 transition"
        >
          Play Weekly Challenge
        </button>
      </div>
    );
  }

  const q = weeklyQuestions[index];

  const submitAnswer = () => {
    if (!q) return;
    const normalized = answer.trim().toLowerCase();
    const correctAns = (q.correct_answer ?? "").trim().toLowerCase();

    if (normalized === correctAns && correctAns !== "") {
      setScore((s) => s + (q.points ?? 0));
      setCorrect((c) => c + 1);
    } else {
      setScore((s) => s - 1);
      setWrong((w) => w + 1);
    }

    setAnswer("");
    setIndex((i) => i + 1);
  };

  const pass = () => {
    setPassed((p) => p + 1);
    setIndex((i) => i + 1);
  };

  const finish = async () => {
    setFinished(true);
    try {
      await fetch("/api/trivia/weekly/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          weekStart,
          score,
          correctCount: correct,
          wrongCount: wrong,
          passedCount: passed,
        }),
      });
    } catch (err) {
      console.error("Weekly submit failed:", err);
    }
  };

  // 🟣 Finished state
  if (finished) {
    return (
      <div className="mt-6 text-center">
        <h2 className="text-2xl font-bold">Weekly Challenge Complete</h2>
        <p className="mt-2 text-slate-300">Score: {score}</p>
        <p className="text-slate-400">
          ✅ {correct} • ❌ {wrong} • ⏭ {passed}
        </p>
      </div>
    );
  }

  // 🔵 End of questions
  if (index >= weeklyQuestions.length) {
    return (
      <div className="text-center mt-6">
        <button
          onClick={finish}
          className="px-5 py-2 rounded-full bg-blue-500 text-slate-900 font-bold hover:bg-blue-600 transition"
        >
          Submit Weekly Challenge
        </button>
      </div>
    );
  }

  // 🟠 Active question
  return (
    <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-700">
      <h2 className="text-lg font-bold mb-2">
        Weekly Challenge — Question {index + 1} / {weeklyQuestions.length}
      </h2>

      <p className="text-slate-200 mb-3">{q.question ?? "No question text"}</p>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer"
        className="w-full p-2 rounded-md bg-slate-950 border border-slate-600 text-slate-200 mb-3"
      />

      <div className="flex gap-3">
        <button
          onClick={submitAnswer}
          className="px-4 py-2 rounded-full bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-600 transition"
        >
          Submit
        </button>
        <button
          onClick={pass}
          className="px-4 py-2 rounded-full bg-orange-500 text-slate-900 font-bold hover:bg-orange-600 transition"
        >
          Pass
        </button>
      </div>
    </div>
  );
}
