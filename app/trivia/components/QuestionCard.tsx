"use client";

import { FormEvent } from "react";

type TriviaQuestion = {
  id: number;
  sport: string;
  question: string;
  answer: string;
  difficulty: string;
  points: number;
  category_tag: string | null;
};

interface Props {
  question: TriviaQuestion;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onPass: () => void;
}

export default function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onSubmit,
  onPass,
}: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
        border: "1px solid #4b5563",
        background: "#020617",
      }}
    >
      <div style={{ marginBottom: 8, fontSize: 14, color: "#9ca3af" }}>
        {question.sport} • {question.difficulty} • {question.points} pts
        {question.category_tag ? ` • ${question.category_tag}` : ""}
      </div>
      <div style={{ fontSize: 18, marginBottom: 12 }}>{question.question}</div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer"
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #4b5563",
            background: "#020617",
            color: "#e5e7eb",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            background: "#3b82f6",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onPass}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            background: "#6b7280",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Pass
        </button>
      </form>
    </div>
  );
}
