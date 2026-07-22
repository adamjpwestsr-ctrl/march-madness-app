"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import DailyShareCard from "./DailyShareCard";
import WeeklyShareCard from "./WeeklyShareCard";
import GenericShareCard from "./GenericShareCard";
import ShareButtons from "./ShareButtons";

export default function TriviaShareRouterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode");
  const score = searchParams.get("score");
  const streak = searchParams.get("streak");

  // In production, replace with actual user name from session
  const player = "PLAYER A";

  // Validate required params
  const missingScore = !score || isNaN(Number(score));
  const missingMode = !mode;

  if (missingScore || missingMode) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/30 border border-red-700 text-red-300 p-8 rounded-xl shadow-xl text-center max-w-xl"
        >
          <h2 className="text-2xl font-bold mb-4">Invalid Share Link</h2>
          <p className="mb-6">Missing required share parameters.</p>

          <button
            onClick={() => router.push("/trivia")}
            className="
              px-8 py-3 text-xl font-bold rounded-xl
              bg-gradient-to-r from-emerald-500 to-cyan-500
              text-white shadow-[0_0_35px_rgba(16,185,129,1)]
              hover:shadow-[0_0_55px_rgba(16,185,129,1)]
              transition-all duration-300
            "
          >
            Back to Trivia Hub
          </button>
        </motion.div>
      </div>
    );
  }

  const numericScore = Number(score);
  const numericStreak = streak ? Number(streak) : null;

  // Build share URL
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/trivia`;
  const shareText =
    mode === "weekly"
      ? `${player} completed a ${numericStreak}-day streak with ${numericScore} points!`
      : `${player} scored ${numericScore}/10 in today's Trivia Challenge!`;

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-20 px-6">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(16,185,129,1)] mb-12 tracking-wide text-center"
      >
        Share Your Score
      </motion.h1>

      {/* Share Card */}
      <div className="mb-12">
        {mode === "daily" && (
          <DailyShareCard player={player} score={numericScore} />
        )}

        {mode === "weekly" && (
          <WeeklyShareCard
            player={player}
            score={numericScore}
            streak={numericStreak || 0}
          />
        )}

        {mode !== "daily" && mode !== "weekly" && (
          <GenericShareCard player={player} score={numericScore} />
        )}
      </div>

      {/* Share Buttons */}
      <ShareButtons url={shareUrl} text={shareText} />

      {/* Back Button */}
      <div className="mt-12">
        <button
          onClick={() => router.push("/trivia")}
          className="
            px-8 py-3 text-xl font-bold rounded-xl
            bg-gradient-to-r from-emerald-500 to-cyan-500
            text-white shadow-[0_0_35px_rgba(16,185,129,1)]
            hover:shadow-[0_0_55px_rgba(16,185,129,1)]
            transition-all duration-300
          "
        >
          Back to Trivia Hub
        </button>
      </div>
    </div>
  );
}
