"use client";

import Link from "next/link";

export default function ChallengeOverviewPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-center drop-shadow-lg">
          Challenge Overview
        </h1>

        <p className="text-slate-300 text-center text-lg">
          Explore every challenge BracketBoss offers — across football, basketball,
          baseball, hockey, golf, racing, trivia, and more.
        </p>

        {/* SECTION: BRACKETS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏀 March Madness Brackets</h2>
          <p className="text-slate-400 leading-relaxed">
            Build up to 4 brackets, track every upset, and compete across all rounds
            for your chance at a large payout!
          </p>
        </section>

        {/* SECTION: MULLIGANS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">♻️ Mulligans</h2>
          <p className="text-slate-400 leading-relaxed">
            Is your March Madness Bracket in trouble? Undo early picks with a Mulligan
            (only available on BracketBoss) — limited per season.
          </p>
        </section>

        {/* SECTION: NFL */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏈 NFL Weekly Picks</h2>
          <p className="text-slate-400 leading-relaxed">
            One pick per week. No repeating teams. Build streaks and climb the standings.
          </p>
        </section>

        {/* SECTION: MLB */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">⚾ MLB Weekly Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Pick the winner of each weekly series. Earn points for correct predictions.
          </p>

          <h3 className="text-xl font-semibold">💥 MLB Home Run Derby</h3>
          <p className="text-slate-400 leading-relaxed">
            Choose your Derby champion. Track HR totals, momentum, and Derby rankings.
            (Only available during All Star Week).
          </p>
        </section>

        {/* SECTION: NHL */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏒 NHL Weekly Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Predict winners of each weekly series. Like the MLB Weekly challenge,
            earn points for correct predictions.
          </p>
        </section>

        {/* SECTION: NBA */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏀 NBA Weekly Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Pick winners of each weekly series. Like the MLB and NHL Weekly challenges,
            earn points for correct predictions.
          </p>
        </section>

        {/* SECTION: GOLF */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">⛳ Golf Weekly</h2>
          <p className="text-slate-400 leading-relaxed">
            Pick your Golfer each week, and follow live scoring and leaderboard movement,
            while you earn points and try to claim the top spot on the leaderboard.
          </p>
        </section>

        {/* SECTION: NASCAR */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏁 NASCAR Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Pick your favorite racer each week. Score based on laps led, stage wins,
            finishing position, and bonus events. Try to own the leaderboard!
          </p>
        </section>

        {/* SECTION: TRIVIA */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🧠 Trivia Blitz</h2>
          <p className="text-slate-400 leading-relaxed">
            Sports knowledge living in your brain rent-free? We have what you need!
            Timed sports trivia with streak bonuses and rapid‑fire scoring.
          </p>
        </section>

        {/* SECTION: LEADERBOARD */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">📊 Leaderboard Tracking</h2>
          <p className="text-slate-400 leading-relaxed">
            Watch your rank climb across all sports, challenges, and seasons.
          </p>
        </section>

        {/* SECTION: LOGIN & REWARDS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🔐 Password‑Free Login</h2>
          <p className="text-slate-400 leading-relaxed">
            Your email is your secure key — fast, simple, and safe.
          </p>

          <h2 className="text-2xl font-bold">🏆 Rewards & Badges</h2>
          <p className="text-slate-400 leading-relaxed">
            Earn achievements, bragging rights, and occasional prizes.
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
