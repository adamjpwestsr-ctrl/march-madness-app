"use client";

import { useEffect, useState } from "react";

export default function DailyChallenge({ displayName }: { displayName: string }) {
  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trivia/daily");
        const data = await res.json();

        // API returns { question: {...} } or { error: ... }
        if (!data || data.error || !data.question) {
          setError(data?.error ?? "Daily challenge unavailable");
          return;
        }

        setQuestion(data.question);
      } catch (err) {
        setError("Failed to load daily challenge");
      }
    }

    load();
  }, []);

  // If API failed → render nothing (prevents hydration crash)
  if (error) return null;

  // If still loading → render nothing
  if (!question) return null;

  const submit = async () => {
    if (!answer.trim()) return;

    const normalized = answer.trim().toLowerCase();
    const correct = (question.correct_answer ?? "").trim().toLowerCase();
    const isCorrect = normalized === correct;

    setResult(isCorrect ? "correct" : "wrong");

    await fetch("/api/trivia/daily/submit", {
      method: "POST",
      body: JSON.stringify({
        displayName,
        questionId: question.id,
        correct: isCorrect,
      }),
    });
  };

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
        Daily Challenge Question
      </h2>

      <p style={{ marginBottom: 12, color: "#e5e7eb" }}>
        {question.question}
      </p>

      {result === null ? (
        <>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #4b5563",
              background: "#020617",
              color: "#e5e7eb",
              marginBottom: 8,
            }}
          />
          <button
            onClick={submit}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background: "#3b82f6",
              color: "#020617",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Submit
          </button>
        </>
      ) : result === "correct" ? (
        <p style={{ color: "#22c55e", fontWeight: 700 }}>Correct! 🏆</p>
      ) : (
        <p style={{ color: "#f87171", fontWeight: 700 }}>
          Wrong — better luck tomorrow.
        </p>
      )}
    </div>
  );
}
