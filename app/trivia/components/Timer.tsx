"use client";

import { useEffect, useState } from "react";

interface Props {
  duration: number;
  onExpire: () => void;
}

export default function Timer({ duration, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const id = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [timeLeft, onExpire]);

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
