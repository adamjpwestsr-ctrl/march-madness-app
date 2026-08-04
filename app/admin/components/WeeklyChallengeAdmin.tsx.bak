"use client";

import { useEffect, useState } from "react";

export default function WeeklyChallengeAdmin() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [weekStart, setWeekStart] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trivia/all-questions");
      const data = await res.json();
      setQuestions(data);
    }
    load();

    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setWeekStart(monday.toISOString().slice(0, 10));
  }, []);

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 10
        ? [...prev, id]
        : prev
    );
  };

  const submit = async () => {
    await fetch("/api/admin/weekly/set", {
      method: "POST",
      body: JSON.stringify({ questionIds: selected, weekStart }),
    });
    alert("Weekly Challenge Updated");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Weekly Challenge Admin</h1>
      <p style={{ marginBottom: 16 }}>
        Select exactly 10 questions for this week's challenge.
      </p>

      <div style={{ marginBottom: 16 }}>
        <strong>Week Start:</strong> {weekStart}
      </div>

      <div style={{ marginBottom: 16 }}>
        Selected: {selected.length} / 10
      </div>

      <div style={{ maxHeight: 500, overflowY: "scroll", border: "1px solid #334155", padding: 12 }}>
        {questions.map((q) => (
          <div
            key={q.id}
            onClick={() => toggle(q.id)}
            style={{
              padding: 8,
              marginBottom: 6,
              borderRadius: 6,
              cursor: "pointer",
              background: selected.includes(q.id)
                ? "rgba(34,197,94,0.3)"
                : "rgba(15,23,42,0.6)",
              border: selected.includes(q.id)
                ? "1px solid #22c55e"
                : "1px solid #334155",
            }}
          >
            <strong>{q.sport}</strong>: {q.question}
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={selected.length !== 10}
        style={{
          marginTop: 16,
          padding: "10px 20px",
          borderRadius: 999,
          background: selected.length === 10 ? "#22c55e" : "#4b5563",
          color: "#020617",
          fontWeight: 700,
          cursor: selected.length === 10 ? "pointer" : "not-allowed",
        }}
      >
        Save Weekly Challenge
      </button>
    </div>
  );
}
