"use client";

import { useEffect, useState, useTransition } from "react";
import { getRandomQuestions } from "./actions/getRandomQuestions";
import { submitRoundProxy } from "./actions/submitRoundProxy";
import QuestionCard from "./components/QuestionCard";
import Timer from "./components/Timer";
import Leaderboard from "./components/Leaderboard";
import ScoreSummary from "./components/ScoreSummary";

type TriviaQuestion = {
  id: number;
  sport: string;
  question: string;
  answer: string;
  difficulty: string;
  points: number;
  category_tag: string | null;
};

type LeaderboardEntry = {
  id: number;
  display_name: string;
  score: number;
  created_at: string;
};

interface Props {
  initialLeaderboard: LeaderboardEntry[];
}

export default function TriviaGameClient({ initialLeaderboard }: Props) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [roundFinished, setRoundFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
  const [displayName, setDisplayName] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      endRound();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, timeLeft]);

  const startRound = async () => {
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setPassedCount(0);
    setTimeLeft(60);
    setRoundFinished(false);
    setCurrentIndex(0);
    setAnswer("");

    const qs = await getRandomQuestions();
    setQuestions(qs);
    setIsRunning(true);
  };

  const endRound = () => {
    setIsRunning(false);
    setRoundFinished(true);

    if (!displayName.trim()) return;

    startTransition(async () => {
      const updatedLeaderboard = await submitRoundProxy({
        displayName: displayName.trim(),
        score,
        correctCount,
        wrongCount,
        passedCount,
        durationSec: 60,
      });
      setLeaderboard(updatedLeaderboard);
    });
  };

  const handleSubmit = () => {
    if (!isRunning || !questions[currentIndex]) return;

    const current = questions[currentIndex];
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrect = current.answer.trim().toLowerCase();

    if (!normalizedAnswer) return;

    // --- SMART TOKENIZED MATCHING ---
    const userWords = normalizedAnswer.split(" ").filter(Boolean);
    const correctWords = normalizedCorrect.split(" ").filter(Boolean);

    // User must match ALL their words somewhere in the correct answer
    const isMatch = userWords.every((w) => correctWords.includes(w));

    if (isMatch) {
      setScore((s) => s + current.points);
      setCorrectCount((c) => c + 1);
    } else {
      setScore((s) => s - 1);
      setWrongCount((w) => w + 1);
    }
    // --------------------------------

    setAnswer("");
    setCurrentIndex((i) => i + 1);
  };

  const handlePass = () => {
    if (!isRunning || !questions[currentIndex]) return;
    setPassedCount((p) => p + 1);
    setAnswer("");
    setCurrentIndex((i) => i + 1);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 24,
        padding: 24,
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
      }}
    >
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Sports Trivia Blitz
        </h1>
        <p style={{ marginBottom: 16, color: "#9ca3af" }}>
          60 seconds. Answer as many as you can. Correct answers = 1–3 points, wrong answers = -1 point, pass = 0 points.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
            Display Name (for leaderboard)
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter a name"
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #4b5563",
              background: "#020617",
              color: "#e5e7eb",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <Timer timeLeft={timeLeft} />
          <div>Score: {score}</div>
          <button
            onClick={startRound}
            disabled={isRunning || !displayName.trim()}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: isRunning ? "#4b5563" : "#22c55e",
              color: "#020617",
              cursor: isRunning ? "default" : "pointer",
              fontWeight: 600,
            }}
          >
            {isRunning ? "Round in Progress" : "Start 60-Second Run"}
          </button>
        </div>

        {isRunning && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            answer={answer}
            onAnswerChange={setAnswer}
            onSubmit={handleSubmit}
            onPass={handlePass}
          />
        )}

        {isRunning && !currentQuestion && (
          <div style={{ marginTop: 24 }}>
            <p>No more questions in this batch. Ending round...</p>
            <button
              onClick={endRound}
              style={{
                marginTop: 8,
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "#3b82f6",
                color: "#e5e7eb",
                cursor: "pointer",
              }}
            >
              End Round Now
            </button>
          </div>
        )}

        {roundFinished && (
          <ScoreSummary
            score={score}
            correct={correctCount}
            wrong={wrongCount}
            passed={passedCount}
          />
        )}

        <div id="trivia-ad-banner" style={{ marginTop: 32, height: 80 }} />
      </div>

      <div>
        <Leaderboard entries={leaderboard} loading={isPending} />
        <div id="trivia-ad-interstitial" style={{ marginTop: 24 }} />
      </div>
    </div>
  );
}
