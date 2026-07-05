"use client";

import Link from "next/link";

export default function ScoringPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-center drop-shadow-lg">
          How Scoring Works
        </h1>

        <p className="text-slate-300 text-center text-lg">
          Every BracketBoss challenge uses a clear, fair scoring system designed to reward
          strategy, consistency, and sports knowledge. Here’s how each challenge works.
        </p>

        {/* MARCH MADNESS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏀 March Madness Brackets</h2>
          <p className="text-slate-400 leading-relaxed">
            Each correct pick earns points based on the round. Upsets earn bonus points.
            Mulligans allow limited early‑round corrections.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Round of 64: 1 point</li>
            <li>• Round of 32: 2 points</li>
            <li>• Sweet 16: 3 points</li>
            <li>• Elite 8: 5 points</li>
            <li>• Final Four: 8 points</li>
            <li>• Championship: 13 points</li>
            <li>• Upset Bonus: +1 to +3 depending on seed difference</li>
          </ul>
        </section>

        {/* NFL WEEKLY */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏈 NFL Weekly Picks</h2>
          <p className="text-slate-400 leading-relaxed">
            One pick per week. No repeating teams. Scoring rewards streaks and consistency.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Correct Pick: 3 points</li>
            <li>• Incorrect Pick: -1 point</li>
            <li>• Weekly Streak Bonus: +1 per consecutive correct week</li>
            <li>• Perfect Season Bonus: +10</li>
          </ul>
        </section>

        {/* MLB WEEKLY */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">⚾ MLB Weekly Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Predict the winner of each weekly series. Earn points for correct predictions.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Correct Series Winner: 2 points</li>
            <li>• Incorrect Series Winner: 0 points</li>
            <li>• Sweep Bonus: +1</li>
          </ul>

          <h3 className="text-xl font-semibold">💥 MLB Home Run Derby</h3>
          <p className="text-slate-400 leading-relaxed">
            Choose your Derby champion. Track HR totals, momentum, and Derby rankings.
            (Only available during All Star Week).
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Each Home Run: 1 point</li>
            <li>• Round Win: +3 points</li>
            <li>• Derby Champion: +10 points</li>
          </ul>
        </section>

        {/* NHL WEEKLY */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏒 NHL Weekly Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Predict winners of each weekly series. Earn points for correct predictions.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Correct Series Winner: 2 points</li>
            <li>• Incorrect Series Winner: 0 points</li>
            <li>• Sweep Bonus: +1</li>
          </ul>
        </section>

        {/* NBA WEEKLY */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏀 NBA Weekly Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Pick winners of each weekly series. Earn points for correct predictions.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Correct Series Winner: 2 points</li>
            <li>• Incorrect Series Winner: 0 points</li>
            <li>• Sweep Bonus: +1</li>
          </ul>
        </section>

        {/* GOLF WEEKLY */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">⛳ Golf Weekly</h2>
          <p className="text-slate-400 leading-relaxed">
            Pick your Golfer each week and follow live scoring. Points are based on
            finishing position.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• 1st Place: 10 points</li>
            <li>• 2nd Place: 7 points</li>
            <li>• 3rd Place: 5 points</li>
            <li>• Top 10 Finish: 3 points</li>
            <li>• Made Cut: 1 point</li>
          </ul>
        </section>

        {/* NASCAR */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏁 NASCAR Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Pick your favorite racer each week. Score based on laps led, stage wins,
            finishing position, and bonus events.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Race Win: 10 points</li>
            <li>• Top 5 Finish: 6 points</li>
            <li>• Top 10 Finish: 3 points</li>
            <li>• Stage Win: 2 points</li>
            <li>• Laps Led: 0.1 points per lap</li>
          </ul>
        </section>

        {/* TRIVIA */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🧠 Trivia Blitz</h2>
          <p className="text-slate-400 leading-relaxed">
            Timed sports trivia with streak bonuses and rapid‑fire scoring.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Correct Answer: 1–3 points (based on difficulty)</li>
            <li>• Incorrect Answer: -1 point</li>
            <li>• Pass: 0 points</li>
            <li>• Streak Bonus: +1 per 3 consecutive correct answers</li>
          </ul>
        </section>

        {/* LEADERBOARD */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">📊 Leaderboard Tracking</h2>
          <p className="text-slate-400 leading-relaxed">
            All challenge points contribute to your global BracketBoss ranking.
          </p>
        </section>

        {/* NAVIGATION */}
        <div className="pt-10 text-center space-y-3">
          <Link
            href="/"
            className="text-emerald-400 underline hover:text-emerald-300"
          >
            Back to Login
          </Link>

          <br />

          <Link
            href="/home"
            className="text-emerald-400 underline hover:text-emerald-300"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
