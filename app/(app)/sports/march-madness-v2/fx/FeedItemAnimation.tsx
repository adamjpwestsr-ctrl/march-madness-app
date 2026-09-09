"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";

export default function FeedItemAnimation({
  type,
  children,
}: {
  type: "pick" | "score" | "win" | "loss";
  children: React.ReactNode;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setAnimate(true);

    // Reset after animation completes
    const timer = setTimeout(() => setAnimate(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={clsx(
        "transition-all duration-700",
        animate && {
          pick: "animate-[slideIn_0.7s_ease-out,glow_1.2s_ease-out]",
          score: "animate-[pulse_0.7s_ease-out,bounce_0.7s_ease-out]",
          win: "animate-[flashGreen_0.7s_ease-out]",
          loss: "animate-[flashRed_0.7s_ease-out]",
        }[type]
      )}
    >
      {children}
    </div>
  );
}
