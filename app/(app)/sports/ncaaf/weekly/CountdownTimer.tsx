"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer({ lockTime }: { lockTime: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const lock = new Date(lockTime).getTime();
      const diff = lock - now;

      if (diff <= 0) {
        setText("Locked");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setText(`${h}h ${m}m ${s}s until lock`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockTime]);

  return (
    <p
      className={`text-sm ${
        text === "Locked" ? "text-red-400" : "text-[var(--bb-gold)]"
      }`}
    >
      {text}
    </p>
  );
}
