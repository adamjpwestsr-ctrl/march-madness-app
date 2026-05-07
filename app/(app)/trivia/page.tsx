"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DailyChallenge from "@/app/trivia/components/DailyChallenge";
import WeeklyChallenge from "@/app/trivia/components/WeeklyChallenge";
import TriviaModeCard from "@/app/components/TriviaModeCard";
import HallOfFame from "@/app/trivia/components/HallOfFame";

export default function TriviaHub() {
  const [weekly, setWeekly] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = "Guest";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trivia/weekly", { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }

        const json = await res.json();

        // Validate shape
        if (!json || !json.weekStart || !Array.isArray(json.questions)) {
          throw new Error("Invalid weekly trivia format");
        }

        setWeekly(json);
      } catch (err: any) {
        console.error("Trivia weekly load error:", err);
        setError("Unable to load weekly trivia right now.");
      } finally {
        setLoading(false);
      }
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

      {/* Daily + Weekly */}
      <section className="grid gap-6 md:grid-cols-2">
        <Link href="/trivia/game?mode=daily" className="block">
          <DailyChallenge displayName={displayName} />
        </Link>

        <Link href="/challenges/weekly" className="block">
          {loading && (
            <div className="rounded-xl border border-slate-800 p-6 bg-slate-900/40 text-slate-400">
              Loading weekly challenge…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-800 p-6 bg-red-900/20 text-red-300">
              {error}
            </div>
          )}

          {weekly && !loading && !error && (
            <WeeklyChallenge
              displayName={displayName}
              weekStart={weekly.weekStart}
              weeklyQuestions={weekly.questions}
            />
          )}
        </Link>
      </section>

      {/* Trivia Modes */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Trivia Modes</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/trivia/game?mode=blitz" className="block">
            <TriviaModeCard
              title="Blitz Mode"
              description="10 rapid-fire questions. No time to think."
              color="from-purple-500 to-fuchsia-600"
              status="Open"
            />
          </Link>

          <Link href="/trivia/game?mode=timed" className="block">
            <TriviaModeCard
              title="Timed Mode"
              description="Beat the clock with precision and speed."
              color="from-blue-500 to-cyan-600"
              status="Open"
            />
          </Link>

          <Link href="/trivia/game?mode=classic" className="block">
            <TriviaModeCard
              title="Classic Mode"
              description="Standard trivia. Accuracy over speed."
              color="from-emerald-500 to-green-600"
              status="Open"
            />
          </Link>
        </div>
      </section>

      {/* Hall of Fame */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Hall of Fame</h2>
        <HallOfFame />
      </section>
    </div>
  );
}
