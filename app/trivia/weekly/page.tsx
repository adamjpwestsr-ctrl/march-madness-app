"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WeeklyChallengePage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [weekInfo, setWeekInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWeekly() {
      try {
        const res = await fetch("/api/trivia/weekly", { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Weekly API returned ${res.status}`);
        }

        const json = await res.json();

        if (!json || !Array.isArray(json.questions)) {
          throw new Error("Invalid weekly trivia format");
        }

        setQuestions(json.questions);
        setWeekInfo(json.weekInfo || null);
      } catch (err) {
        console.error("Weekly trivia load error:", err);
        setError("Unable to load this week's challenge.");
      } finally {
        setLoading(false);
      }
    }

    loadWeekly();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-20 px-6">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(34,211,238,1)] mb-10 tracking-wide"
      >
        Weekly Trivia Challenge
      </motion.h1>

      {/* Week Info */}
      {!loading && !error && weekInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-300 text-lg mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]"
        >
          Week of <span className="text-cyan-400 font-bold">{weekInfo.weekStart}</span>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400 text-xl drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]"
        >
          Loading this week’s challenge…
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-xl shadow-lg text-center max-w-xl">
          {error}
        </div>
      )}

      {/* Start Button */}
      {!loading && !error && questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <Link
            href={{
              pathname: "/trivia/play",
              query: { mode: "weekly" },
            }}
          >
            <button
              className="
                px-10 py-5 text-2xl font-bold rounded-xl
                bg-gradient-to-r from-cyan-500 to-purple-500
                text-white shadow-[0_0_35px_rgba(34,211,238,1)]
                hover:shadow-[0_0_55px_rgba(34,211,238,1)]
                transition-all duration-300
              "
            >
              Start Weekly Challenge
            </button>
          </Link>
        </motion.div>
      )}

      {/* No Questions */}
      {!loading && !error && questions.length === 0 && (
        <div className="text-slate-400 text-lg mt-10">
          No weekly questions available. Check back soon!
        </div>
      )}
    </div>
  );
}
