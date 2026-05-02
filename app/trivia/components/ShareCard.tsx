"use client";

import { useState } from "react";

const CTAS = [
  "Think you can top this? Step into the arena.",
  "If you're brave enough, take your shot.",
  "Come prove you're not just another armchair quarterback.",
  "Beat this score or stay on the sidelines.",
  "Your move, champ. Let’s see what you’ve got.",
];

export default function ShareCard({ score, displayName }: { score: number; displayName: string }) {
  const [copied, setCopied] = useState(false);

  const cta = CTAS[Math.floor(Math.random() * CTAS.length)];

  const shareText = `
${displayName} just dropped ${score} points in Sports Trivia Blitz.

${cta}

Play now: https://bracketboss-theta.vercel.app/trivia
  `.trim();

  const copy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
        Share Your Score
      </h3>

      <textarea
        readOnly
        value={shareText}
        style={{
          width: "100%",
          height: 120,
          padding: 12,
          borderRadius: 8,
          background: "#0f172a",
          border: "1px solid #334155",
          color: "#e5e7eb",
          fontSize: 13,
          resize: "none",
        }}
      />

      <button
        onClick={copy}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          borderRadius: 999,
          border: "none",
          background: copied ? "#22c55e" : "#3b82f6",
          color: "#020617",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        {copied ? "Copied!" : "Copy & Brag"}
      </button>
    </div>
  );
}
