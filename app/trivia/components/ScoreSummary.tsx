"use client";

interface Props {
  score: number;
  correct: number;
  wrong: number;
  passed: number;
}

function getComment(score: number, correct: number, wrong: number, passed: number): string {
  if (score >= 20 && correct >= 10) {
    return "Absolute unit. You’re built for trivia greatness.";
  }
  if (correct >= 10 && passed === 0) {
    return "No passes? You’re fearless.";
  }
  if (passed > correct && correct > 0) {
    return "Must be nice cherry-picking the ones you know.";
  }
  if (wrong > correct) {
    return "Bold strategy. Accuracy is optional, right?";
  }
  if (score <= 0) {
    return "Tough round. Hydrate, reset, and run it back.";
  }
  return "Solid run. You’ve got more in the tank.";
}

export default function ScoreSummary({ score, correct, wrong, passed }: Props) {
  const comment = getComment(score, correct, wrong, passed);

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        borderRadius: 8,
        border: "1px solid #4b5563",
        background: "#020617",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Round Summary</h2>
      <p style={{ marginBottom: 8 }}>
        Score: <strong>{score}</strong>
      </p>
      <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 8 }}>
        Correct: {correct} • Wrong: {wrong} • Passed: {passed}
      </p>
      <p style={{ fontSize: 14 }}>{comment}</p>
    </div>
  );
}
