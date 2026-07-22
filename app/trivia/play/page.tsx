"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

type TriviaQuestion = {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  points: number;
};

export default function TriviaPlayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "daily"; // daily | weekly

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Weekly streak (only used in weekly mode)
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      setError(null);

      try {
        const endpoint =
          mode === "weekly" ? "/api/trivia/weekly" : "/api/trivia/daily";

        const res = await fetch(endpoint, { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Trivia API returned ${res.status}`);
        }

        const json = await res.json();

        if (!json || !Array.isArray(json.questions)) {
          throw new Error("Invalid trivia format");
        }

        setQuestions(json.questions);

        if (mode === "weekly" && json.streak) {
          setStreak(json.streak);
        }
      } catch (err) {
        console.error("Trivia play load error:", err);
        setError("Unable to load questions.");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [mode]);

  const currentQuestion = useMemo(
    () => questions[currentIndex] || null,
    [questions, currentIndex]
  );

  function handleAnswer(index: number) {
    if (!currentQuestion || selectedIndex !== null) return;
    setSelectedIndex(index);

    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + currentQuestion.points);
    }
  }

  function handleNext() {
    if (!currentQuestion) return;

    const isLast = currentIndex === questions.length - 1;
    if (isLast) {
      handleFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
    }
  }

  async function handleFinish() {
    setFinished(true);

    try {
      // Write round results to DB
      await fetch("/api/trivia/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          score,
          streak: mode === "weekly" ? streak : null,
        }),
      });
    } catch (err) {
      console.error("Error writing round:", err);
    }

    // Redirect to share router
    router.push(
      `/trivia/share?mode=${mode}&score=${score}${
        mode === "weekly" ? `&streak=${streak}` : ""
      }`
    );
  }

  function handleBackToHub() {
    router.push("/trivia");
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-20 px-6">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(16,185,129,1)] mb-8 tracking-wide text-center"
      >
        {mode === "weekly" ? "Weekly Trivia Challenge" : "Daily Trivia Challenge"}
      </motion.h1>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400 text-xl drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]"
        >
          Loading questions…
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-xl shadow-lg text-center max-w-xl">
          {error}
        </div>
      )}

      {/* Finished Summary */}
      {!loading && !error && finished && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-xl p-10 shadow-xl max-w-xl text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Challenge Complete!</h2>
          <p className="text-cyan-400 text-2xl font-extrabold mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            Score: {score}
          </p>

          {mode === "weekly" && streak !== null && (
            <p className="text-purple-400 text-xl font-bold mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,1)]">
              Weekly Streak: {streak} days
            </p>
          )}

          <button
            onClick={handleBackToHub}
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
      )}

      {/* Question View */}
      {!loading && !error && !finished && currentQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl"
        >
          {/* Progress */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-300">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-cyan-400 font-bold drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
              Score: {score}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {currentQuestion.question}
          </h2>

          {/* Choices */}
          <div className="space-y-4">
            {currentQuestion.choices.map((choice, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === currentQuestion.correctIndex;
              const showResult = selectedIndex !== null;

              let bg = "bg-slate-800";
              let border = "border-slate-700";
              let shadow = "";

              if (showResult && isCorrect) {
                bg = "bg-emerald-700";
                border = "border-emerald-400";
                shadow = "shadow-[0_0_25px_rgba(16,185,129,1)]";
              } else if (showResult && isSelected && !isCorrect) {
                bg = "bg-red-800";
                border = "border-red-500";
                shadow = "shadow-[0_0_25px_rgba(220,38,38,1)]";
              } else if (isSelected) {
                bg = "bg-slate-700";
                border = "border-cyan-400";
                shadow = "shadow-[0_0_20px_rgba(34,211,238,0.8)]";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedIndex !== null}
                  className={`
                    w-full text-left p-4 rounded-lg border ${bg} ${border} ${shadow}
                    text-slate-100 transition-all duration-200
                    disabled:cursor-not-allowed
                  `}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {/* Next / Finish Button */}
          {selectedIndex !== null && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                className="
                  px-8 py-3 text-xl font-bold rounded-xl
                  bg-gradient-to-r from-emerald-500 to-cyan-500
                  text-white shadow-[0_0_35px_rgba(16,185,129,1)]
                  hover:shadow-[0_0_55px_rgba(16,185,129,1)]
                  transition-all duration-300
                "
              >
                {currentIndex === questions.length - 1 ? "Finish" : "Next Question"}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* No Questions */}
      {!loading && !error && !finished && !currentQuestion && (
        <div className="text-slate-400 text-lg mt-10">
          No questions available for this mode.
        </div>
      )}
    </div>
  );
}
