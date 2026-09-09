"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";

export default function RankChangeAnimation({
  children,
  rankChange,
}: {
  children: React.ReactNode;
  rankChange: number;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (rankChange !== 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [rankChange]);

  return (
    <div
      className={clsx(
        "transition-all duration-700",
        animate &&
          (rankChange > 0
            ? "animate-[rankUp_0.7s_ease-out,glowGreen_1.2s_ease-out]"
            : "animate-[rankDown_0.7s_ease-out,glowRed_1.2s_ease-out]")
      )}
    >
      {children}
    </div>
  );
}
