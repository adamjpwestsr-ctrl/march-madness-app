"use client";

interface Props {
  timeLeft: number;
}

export default function Timer({ timeLeft }: Props) {
  return (
    <div
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        border: "1px solid #4b5563",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      Time: {timeLeft}s
    </div>
  );
}
