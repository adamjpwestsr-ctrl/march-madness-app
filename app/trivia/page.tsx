"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/* ---------- Types ---------- */

interface TriviaCardProps {
  title: string;
  description: string;
  href: string;
  glow: "emerald" | "cyan" | "purple";
}

/* ---------- Page Component ---------- */

export default function TriviaLandingPage() {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-20 px-6">

      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(16,185,129,1)] mb-12 tracking-wide"
      >
        Trivia Challenge Hub
      </motion.h1>

      {/* Feature Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">

        <TriviaCard
          title="Daily Challenge"
          description="10 questions. New every day. Earn points and climb the leaderboard."
          href="/trivia/daily"
          glow="emerald"
        />

        <TriviaCard
          title="Weekly Challenge"
          description="7‑day streak challenge. Score big and earn weekly badges."
          href="/trivia/weekly"
          glow="cyan"
        />

        <TriviaCard
          title="Leaderboard"
          description="See how you stack up against other players."
          href="/trivia/leaderboard"
          glow="purple"
        />

      </div>
    </div>
  );
}

/* ---------- Trivia Card Component ---------- */

function TriviaCard({ title, description, href, glow }: TriviaCardProps) {
  const glowMap: Record<TriviaCardProps["glow"], string> = {
    emerald:
      "shadow-[0_0_25px_rgba(16,185,129,1)] hover:shadow-[0_0_45px_rgba(16,185,129,1)]",
    cyan:
      "shadow-[0_0_25px_rgba(34,211,238,1)] hover:shadow-[0_0_45px_rgba(34,211,238,1)]",
    purple:
      "shadow-[0_0_25px_rgba(168,85,247,1)] hover:shadow-[0_0_45px_rgba(168,85,247,1)]",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`bg-slate-900 border border-slate-700 rounded-xl p-8 cursor-pointer transition-all duration-300 ${glowMap[glow]}`}
    >
      <Link href={href}>
        <div className="flex flex-col items-start">
          <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
