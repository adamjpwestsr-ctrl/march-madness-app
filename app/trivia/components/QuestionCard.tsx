"use client";

type TriviaQuestion = {
  id: number;
  sport: string;
  question: string;
  correct_answer: string;
  choices: string[];
  difficulty: string;
  points: number;
  category_tag: string | null;
};

interface Props {
  question: TriviaQuestion;
  onSelectChoice: (choice: string) => void;
  onPass: () => void;
}

export default function QuestionCard({ question, onSelectChoice, onPass }: Props) {
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

      {/* MULTIPLE CHOICE BUTTONS */}
      <div style={{ display: "grid", gap: 8 }}>
        {question.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => onSelectChoice(choice)}
            style={{
              padding: "10px 14px",
              borderRadius: 6,
              border: "1px solid #4b5563",
              background: "#0f172a",
              color: "#e5e7eb",
              textAlign: "left",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* PASS BUTTON */}
      <button
        type="button"
        onClick={onPass}
        style={{
          marginTop: 12,
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
    </div>
  );
}
