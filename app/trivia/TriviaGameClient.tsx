"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getRandomQuestions } from "./actions/getRandomQuestions";
import { submitRoundProxy } from "./actions/submitRoundProxy";
import QuestionCard from "./components/QuestionCard";
import Timer from "./components/Timer";
import Leaderboard from "./components/Leaderboard";
import ScoreSummary from "./components/ScoreSummary";
import ShareCard from "./components/ShareCard";

// Weekly Challenge system imports
import WeeklyChallenge from "@/app/trivia/components/WeeklyChallenge";
import WeeklyLeaderboard from "@/app/trivia/components/WeeklyLeaderboard";
import WeeklyThemeBanner from "@/app/trivia/weekly/WeeklyThemeBanner";

type TriviaQuestion = {
  id: number;
  sport: string;
  question: string;
  correct_answer: string;
  choices: string[];
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

type RunHistoryEntry = {
  id: number;
  score: number;
  correct: number;
  wrong: number;
  passed: number;
  createdAt: string;
};

type LeaderboardScope = "daily" | "weekly" | "allTime";

export default function TriviaGameClient({ initialLeaderboard }: Props) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [roundFinished, setRoundFinished] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => initialLeaderboard);
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>("allTime");

  const [displayName, setDisplayName] = useState("");
  const [isPending, startTransition] = useTransition();

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>([]);
  const [lastSubmitAt, setLastSubmitAt] = useState<number | null>(null);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  // Weekly Challenge state
  const [showWeekly, setShowWeekly] = useState(false);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [weeklyQuestions, setWeeklyQuestions] = useState<any[] | null>(null);

  // Load Weekly Challenge data
  useEffect(() => {
    async function loadWeekly() {
      try {
        const res = await fetch("/api/trivia/weekly");
        const data = await res.json();

        if (data.weekStart) {
          setWeekStart(data.weekStart);
          setWeeklyQuestions(data.questions);
        }
      } catch (err) {
        console.error("Failed to load weekly challenge:", err);
      }
    }

    loadWeekly();
  }, []);

  // Timer
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
    setStreak(0);
    setSystemMessage(null);

    const qs = await getRandomQuestions();
    setQuestions(qs);
    setIsRunning(true);
  };

  const endRound = () => {
    setIsRunning(false);
    setRoundFinished(true);

    if (!displayName.trim()) {
      setSystemMessage("Add a display name to get on the leaderboard.");
      return;
    }

    const now = Date.now();
    if (lastSubmitAt && now - lastSubmitAt < 3000) {
      setSystemMessage("Easy there, speed demon. Give it a couple seconds before posting another run.");
      return;
    }
    setLastSubmitAt(now);

    const run: RunHistoryEntry = {
      id: Date.now(),
      score,
      correct: correctCount,
      wrong: wrongCount,
      passed: passedCount,
      createdAt: new Date().toISOString(),
    };
    setRunHistory((prev) => [run, ...prev].slice(0, 10));

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

  // MULTIPLE-CHOICE HANDLER
  const handleChoice = (selected: string) => {
    if (!isRunning || !questions[currentIndex]) return;

    const current = questions[currentIndex];
    const isCorrect = selected === current.correct_answer;

    if (isCorrect) {
      setScore((s) => s + current.points);
      setCorrectCount((c) => c + 1);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((bs) => (next > bs ? next : bs));
        return next;
      });
      setSystemMessage("Correct!");
    } else {
      setScore((s) => s - 1);
      setWrongCount((w) => w + 1);
      setStreak(0);
      setSystemMessage(`Wrong! Correct answer: ${current.correct_answer}`);
    }

    setCurrentIndex((i) => i + 1);
  };

  const handlePass = () => {
    if (!isRunning || !questions[currentIndex]) return;
    setPassedCount((p) => p + 1);
    setStreak(0);
    setSystemMessage("Passed");
    setCurrentIndex((i) => i + 1);
  };

  const currentQuestion = questions[currentIndex];

  const personalBest = useMemo(() => {
    if (runHistory.length === 0) return null;
    return runHistory.reduce((best, run) => (run.score > best.score ? run : best), runHistory[0]);
  }, [runHistory]);

  const feedbackMessage = useMemo(() => {
    if (!roundFinished) return null;
    if (score >= 25) return "You’re on fire. This is highlight-reel stuff.";
    if (score >= 15) return "Playoff form. The booth is impressed.";
    if (score >= 5) return "Solid run. You’re in the mix.";
    if (score >= 0) return "Not bad. Warm-up complete. Run it back.";
    if (score > -5) return "Bold strategy. Accuracy is optional, right?";
    return "My friend… were you even watching the same sport?";
  }, [roundFinished, score]);

  const filteredLeaderboard = useMemo(() => {
    const now = new Date();
    if (leaderboardScope === "daily") {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return leaderboard.filter((entry) => new Date(entry.created_at) >= startOfDay);
    }
    if (leaderboardScope === "weekly") {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return leaderboard.filter((entry) => new Date(entry.created_at) >= startOfWeek);
    }
    return leaderboard;
  }, [leaderboard, leaderboardScope]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.1fr",
        gap: 24,
        padding: 24,
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
      }}
    >
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
          Sports Trivia Blitz
        </h1>
        <p style={{ marginBottom: 16, color: "#9ca3af", maxWidth: 520 }}>
          60 seconds. Answer as many as you can. Correct answers = 1–3 points, wrong answers = -1 point, pass = 0 points.
        </p>

        {/* DISPLAY NAME INPUT */}
        <div style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
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
          <div style={{ textAlign: "right", fontSize: 12, color: "#6b7280" }}>
            <div>
              Best streak: <span style={{ color: "#fbbf24" }}>{bestStreak}</span>
            </div>
            {personalBest && (
              <div>
                Personal best:{" "}
                <span style={{ color: "#22c55e" }}>{personalBest.score} pts</span>
              </div>
            )}
          </div>
        </div>

        {/* BLITZ UI */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <Timer timeLeft={timeLeft} />
          <div>Score: {score}</div>
          <button
            onClick={startRound}
            disabled={isRunning || !displayName.trim()}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background: isRunning ? "#4b5563" : "#22c55e",
              color: "#020617",
              cursor: isRunning ? "default" : "pointer",
              fontWeight: 700,
              boxShadow: isRunning ? "none" : "0 0 16px rgba(34,197,94,0.5)",
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
          >
            {isRunning ? "Round in Progress" : "Start 60-Second Run"}
          </button>
        </div>

        {systemMessage && (
          <div
            style={{
              marginBottom: 12,
              padding: 8,
              borderRadius: 6,
              background: "#111827",
              border: "1px solid #4b5563",
              fontSize: 13,
              color: "#e5e7eb",
            }}
          >
            {systemMessage}
          </div>
        )}

        {isRunning && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            onSelectChoice={handleChoice}
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



{weekStart && (
  <div style={{ marginBottom: 24 }}>
    <div
      onClick={() => setShowWeekly((prev) => !prev)}
      style={{ cursor: "pointer" }}
    >
      <WeeklyThemeBanner weekStart={weekStart} />
    </div>

    {showWeekly && (
      <>
        <WeeklyChallenge
          displayName={displayName}
          weekStart={weekStart}
          weeklyQuestions={weeklyQuestions}
          onStartWeekly={() => {
            if (!weeklyQuestions || weeklyQuestions.length === 0) {
              setSystemMessage("Weekly challenge not ready yet.");
              return;
            }
            setQuestions(weeklyQuestions);
            setIsRunning(true);
            setTimeLeft(60);
            setRoundFinished(false);
            setCurrentIndex(0);
            setScore(0);
            setCorrectCount(0);
            setWrongCount(0);
            setPassedCount(0);
            setStreak(0);
            setSystemMessage(null);
          }}
        />

        <WeeklyLeaderboard />
      </>
    )}
  </div>
)}

        {/* BLITZ RESULTS */}
        {roundFinished && (
          <div style={{ marginTop: 24 }}>
            <ScoreSummary
              score={score}
              correct={correctCount}
              wrong={wrongCount}
              passed={passedCount}
            />

            <ShareCard score={score} displayName={displayName} />

            {feedbackMessage && (
              <p style={{ marginTop: 8, color: "#9ca3af", fontStyle: "italic" }}>
                {feedbackMessage}
              </p>
            )}

            <button
              onClick={startRound}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                borderRadius: 999,
                border: "none",
                background: "#f97316",
                color: "#020617",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Run It Back
            </button>
          </div>
        )}

        {/* RECENT RUNS */}
        {runHistory.length > 0 && (
          <div
            style={{
              marginTop: 32,
              padding: 16,
              borderRadius: 12,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid #1f2937",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Your Recent Runs
            </h2>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>
              {runHistory.slice(0, 5).map((run) => (
                <div
                  key={run.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(31,41,55,0.6)",
                  }}
                >
                  <span>
                    {new Date(run.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>
                    <span style={{ color: run.score >= 0 ? "#22c55e" : "#f97316" }}>
                      {run.score} pts
                    </span>{" "}
                    · C:{run.correct} W:{run.wrong} P:{run.passed}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div id="trivia-ad-banner" style={{ marginTop: 32, height: 80 }} />
      </div>

      {/* RIGHT SIDE LEADERBOARD PANEL */}
      <div>
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid #1f2937",
            boxShadow: "0 0 40px rgba(15,23,42,0.9)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Leaderboard</h2>
            <div
              style={{
                display: "inline-flex",
                borderRadius: 999,
                background: "#020617",
                border: "1px solid #374151",
                overflow: "hidden",
              }}
            >
              {[
                { key: "daily", label: "Today" },
                { key: "weekly", label: "This Week" },
                { key: "allTime", label: "All Time" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setLeaderboardScope(tab.key as LeaderboardScope)}
                  style={{
                    padding: "4px 10px",
                    fontSize: 11,
                    border: "none",
                    cursor: "pointer",
                    background:
                      leaderboardScope === tab.key ? "#f97316" : "transparent",
                    color: leaderboardScope === tab.key ? "#020617" : "#9ca3af",
                    fontWeight: leaderboardScope === tab.key ? 700 : 500,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
            Top 10 runs by score. You can appear more than once.
          </p>

          <Leaderboard entries={filteredLeaderboard} loading={isPending} />
        </div>

        {personalBest && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 16,
              background: "rgba(15,23,42,0.95)",
              border: "1px solid #1f2937",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              Your Personal Best
            </h3>
            <div style={{ fontSize: 13, color: "#e5e7eb" }}>
              <div>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>
                  {personalBest.score} pts
                </span>{" "}
                · C:{personalBest.correct} W:{personalBest.wrong} P:{personalBest.passed}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                {new Date(personalBest.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <div id="trivia-ad-interstitial" style={{ marginTop: 24 }} />
      </div>
    </div>
  );
}
