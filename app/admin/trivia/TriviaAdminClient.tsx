"use client";

import { useState, useTransition, FormEvent } from "react";
import { importQuestions } from "./actions/importQuestions";
import { clearLeaderboard } from "./actions/clearLeaderboard";

interface Props {
  questionCount: number;
  roundsCount: number;
}

export default function TriviaAdminClient({ questionCount, roundsCount }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleImport = (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus(null);
    startTransition(async () => {
      const result = await importQuestions(file);
      setStatus(result.message);
    });
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    setStatus(null);
    startTransition(async () => {
      const result = await clearLeaderboard();
      setStatus(result.message);
      setConfirmClear(false);
    });
  };

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 800,
        margin: "0 auto",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Trivia Admin
      </h1>

      <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>
        Questions in pool: {questionCount} • Leaderboard entries: {roundsCount}
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Insert New Questions
        </h2>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>
          Upload a combined CSV (sports_trivia.csv) with columns:
          Sport, Question, Answer, Difficulty, Points, Category Tag.
        </p>
        <form onSubmit={handleImport}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ marginBottom: 8 }}
          />
          <div>
            <button
              type="submit"
              disabled={!file || isPending}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "#3b82f6",
                color: "#e5e7eb",
                cursor: file && !isPending ? "pointer" : "default",
              }}
            >
              {isPending ? "Importing..." : "Import Questions"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Clear Leaderboard
        </h2>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>
          This will remove all trivia runs from the leaderboard. You can’t undo this.
        </p>
        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: confirmClear ? "#ef4444" : "#f97316",
            color: "#020617",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {confirmClear ? "Click again to confirm" : "Clear Leaderboard"}
        </button>
      </section>

      {status && (
        <p style={{ marginTop: 16, fontSize: 13, color: "#a5b4fc" }}>{status}</p>
      )}
    </div>
  );
}
