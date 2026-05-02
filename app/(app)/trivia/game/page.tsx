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

  // REQUIRED BY ScoreSummary
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [passed, setPassed] = useState(0);

  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/trivia/${mode}`);
      const data = await res.json();
      setQuestions(data.questions);
    }
    load();
  }, [mode]);

  function handleAnswer(isCorrect: boolean) {
    if (isCorrect) {
      setScore((s) => s + 1);
      setCorrect((c) => c + 1);
    } else {
      setScore((s) => s - 1);
      setWrong((w) => w + 1);
    }

    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handlePass() {
    setPassed((p) => p + 1);

    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (finished) {
    return (
      <ScoreSummary
        score={score}
        correct={correct}
        wrong={wrong}
        passed={passed}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Timer duration={60} onExpire={() => setFinished(true)} />

      {questions.length > 0 && (
        <QuestionCard
          question={questions[index]}
          onAnswer={handleAnswer}
          onPass={handlePass}
        />
      )}
    </div>
  );
}
