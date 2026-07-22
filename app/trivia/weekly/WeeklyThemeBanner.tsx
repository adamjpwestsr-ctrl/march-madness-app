"use client";

import { motion } from "framer-motion";

/* ---------- Types ---------- */

interface WeeklyThemeBannerProps {
  weekStart: string;
}

/* ---------- Component ---------- */

export default function WeeklyThemeBanner({ weekStart }: WeeklyThemeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        w-full bg-gradient-to-r from-emerald-500 to-cyan-500
        rounded-xl p-6 mb-8 text-white font-bold text-2xl
        shadow-[0_0_35px_rgba(16,185,129,1)]
      "
    >
      Week of {weekStart || "Unknown Week"}
    </motion.div>
  );
}
