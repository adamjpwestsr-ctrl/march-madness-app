"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function DailyShareCard({ player, score }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="
        bg-slate-900 border border-slate-700 rounded-2xl p-10
        shadow-[0_0_45px_rgba(16,185,129,1)]
        text-center max-w-xl mx-auto
      "
    >
      <h2 className="text-3xl font-extrabold text-white mb-4">
        Daily Challenge Complete!
      </h2>

      <p className="text-slate-300 text-lg mb-6">
        {player} scored
      </p>

      <p className="text-emerald-400 text-5xl font-extrabold mb-6 drop-shadow-[0_0_25px_rgba(16,185,129,1)]">
        {score}/10
      </p>

      <p className="text-slate-400 mb-8">
        Think you can beat them?
      </p>

      <Link href="/login?redirect=/trivia">
        <button
          className="
            px-8 py-3 text-xl font-bold rounded-xl
            bg-gradient-to-r from-emerald-500 to-cyan-500
            text-white shadow-[0_0_35px_rgba(16,185,129,1)]
            hover:shadow-[0_0_55px_rgba(16,185,129,1)]
            transition-all duration-300
          "
        >
          Try Today’s Challenge
        </button>
      </Link>
    </motion.div>
  );
}
