"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import QuestionCard from "@/app/trivia/components/QuestionCard";
import Timer from "@/app/trivia/components/Timer";
import ScoreSummary from "@/app/trivia/components/ScoreSummary";

export default function TriviaGamePage() {
  const params = useSearchParams();
  const mode = params.get("mode") || "daily";

  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/trivia/${mode}`);
      const data = await res.json();
      setQuestions(data.questions);
    }
    load();
  }, [mode]);

  function handleAnswer(correct: boolean) {
    if (correct) setScore((s) => s + 1);

    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (!questions.length) {
    return <p className="text-slate-400">Loading questions…</p>;
  }

  if (finished) {
    return <ScoreSummary score={score} total={questions.length} mode={mode} />;
  }

  return (
    <div className="space-y-6">
      {mode === "blitz" && <Timer seconds={60} onExpire={() => setFinished(true)} />}

      <QuestionCard
        question={questions[index]}
        index={index}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
