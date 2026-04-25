"use client";

import { useEffect, useState } from "react";

export default function WeeklyChallenge({
  displayName,
  onWeekStart,
}: {
  displayName: string;
  onWeekStart?: (weekStart: string) => void;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [passed, setPassed] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trivia/weekly");
      const data = await res.json();

      setQuestions(data.questions);
      setWeekStart(data.weekStart);

      // ⭐ Notify parent component
      if (onWeekStart) {
        onWeekStart(data.weekStart);
      }
    }

    load();
  }, [onWeekStart]);

  const submitAnswer = () => {
    const q = questions[index];
    const normalized = answer.trim().toLowerCase();
    const correctAns = q.answer.trim().toLowerCase();

    if (normalized === correctAns) {
      setScore((s) => s + q.points);
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

    await fetch("/api/trivia/weekly/submit", {
      method: "POST",
      body: JSON.stringify({
        displayName,
        weekStart,
        score,
        correctCount: correct,
        wrongCount: wrong,
        passedCount: passed,
      }),
    });
  };

  if (questions.length === 0) return null;

  if (finished) {
    return (
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Weekly Challenge Complete</h2>
        <p style={{ marginTop: 8 }}>Score: {score}</p>
        <p>
          C: {correct} W: {wrong} P: {passed}
        </p>
      </div>
    );
  }

  if (index >= questions.length) {
    return (
      <button
        onClick={finish}
        style={{
          marginTop: 24,
          padding: "10px 20px",
          borderRadius: 999,
          background: "#3b82f6",
          color: "#020617",
          fontWeight: 700,
        }}
      >
        Submit Weekly Challenge
      </button>
    );
  }

  const q = questions[index];

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
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>
        Weekly Challenge — Question {index + 1} / 10
      </h2>

      <p style={{ marginTop: 12 }}>{q.question}</p>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer"
        style={{
          width: "100%",
          padding: 8,
          marginTop: 12,
          borderRadius: 6,
          background: "#020617",
          border: "1px solid #4b5563",
          color: "#e5e7eb",
        }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button
          onClick={submitAnswer}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            background: "#22c55e",
            color: "#020617",
            fontWeight: 700,
          }}
        >
          Submit
        </button>

        <button
          onClick={pass}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            background: "#f97316",
            color: "#020617",
            fontWeight: 700,
          }}
        >
          Pass
        </button>
      </div>
    </div>
  );
}
