"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ---------- Types ---------- */

interface DailyQuestion {
  id?: number;
  question: string;
  answer?: string;
  [key: string]: any;
}

interface DailyResponse {
  questions: DailyQuestion[];
}

/* ---------- Component ---------- */

export default function DailyChallengePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDaily() {
      try {
        const res = await fetch("/api/trivia/daily", { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Daily API returned ${res.status}`);
        }

        const json = (await res.json()) as DailyResponse;

        if (!json || !Array.isArray(json.questions)) {
          throw new Error("Invalid daily trivia format");
        }

        setQuestions(json.questions);
      } catch (err) {
        console.error("Daily trivia load error:", err);
        setError("Unable to load today's challenge.");
      } finally {
        setLoading(false);
      }
    }

    loadDaily();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-20 px-6">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(16,185,129,1)] mb-10 tracking-wide"
      >
        Daily Trivia Challenge
      </motion.h1>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400 text-xl drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]"
        >
          Loading today’s questions…
        </motion.div>
      )}

      {/* Error */}
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
              query: { mode: "daily" },
            }}
          >
            <button
              className="
                px-10 py-5 text-2xl font-bold rounded-xl
                bg-gradient-to-r from-emerald-500 to-cyan-500
                text-white shadow-[0_0_35px_rgba(16,185,129,1)]
                hover:shadow-[0_0_55px_rgba(16,185,129,1)]
                transition-all duration-300
              "
            >
              Start Today’s Challenge
            </button>
          </Link>
        </motion.div>
      )}

      {/* No Questions */}
      {!loading && !error && questions.length === 0 && (
        <div className="text-slate-400 text-lg mt-10">
          No daily questions available. Check back tomorrow!
        </div>
      )}
    </div>
  );
}
