"use client";

import { generateRemainingRounds } from "./actions";

export default function GenerateRoundsButton() {
  const handleGenerate = async () => {
    const res = await generateRemainingRounds();
    alert(res.message);
  };

  return (
    <button
      onClick={handleGenerate}
      style={{
        padding: "12px 24px",
        background: "#3b82f6",
        borderRadius: 6,
        border: "none",
        color: "white",
        fontWeight: 600,
      }}
    >
      Generate Remaining Rounds
    </button>
  );
}
