"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DailyChallenge from "@/app/trivia/components/DailyChallenge";
import WeeklyChallenge from "@/app/trivia/components/WeeklyChallenge";
import TriviaModeCard from "@/app/components/TriviaModeCard";
import HallOfFame from "@/app/trivia/components/HallOfFame";

export default function TriviaHub() {
  const [daily, setDaily] = useState<any>(null);
  const [weekly, setWeekly] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const d = await fetch("/api/trivia/daily").then((r) => r.json());
      const w = await fetch("/api/trivia/weekly").then((r) => r.json());

      setDaily(d);
      setWeekly(w);
    }
    load();
  }, []);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold mb-2">Trivia Hub</h1>
        <p className="text-slate-400">
          Daily questions, weekly challenges, and fast-paced trivia modes.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Link href="/trivia/game?mode=daily" className="block">
          <DailyChallenge data={daily} />
        </Link>

        <Link href="/challenges/weekly" className="block">
          <WeeklyChallenge data={weekly} />
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Trivia Modes</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/trivia/game?mode=blitz" className="block">
            <TriviaModeCard mode="blitz" />
          </Link>

          <Link href="/trivia/game?mode=timed" className="block">
            <TriviaModeCard mode="timed" />
          </Link>

          <Link href="/trivia/game?mode=classic" className="block">
            <TriviaModeCard mode="classic" />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Hall of Fame</h2>
        <HallOfFame />
      </section>
    </div>
  );
}
