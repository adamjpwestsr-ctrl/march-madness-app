"use client";

import Link from "next/link";

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-center drop-shadow-lg">
          New User Quick Start
        </h1>

        <p className="text-slate-300 text-center text-lg">
          Welcome to BracketBoss! This quick guide will help you get started, make your
          first picks, and understand how everything works.
        </p>

        {/* STEP 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1️⃣ Create Your Account</h2>
          <p className="text-slate-400 leading-relaxed">
            BracketBoss uses password‑free login. Just enter your email, verify your
            identity, and you’re in. No passwords to remember — fast, simple, secure.
          </p>
        </section>

        {/* STEP 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2️⃣ Choose Your Challenges</h2>
          <p className="text-slate-400 leading-relaxed">
            You can participate in as many challenges as you want. Each sport has its
            own format, scoring system, and leaderboard.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm leading-relaxed">
            <li>• 🏀 March Madness Brackets</li>
            <li>• 🏈 NFL Weekly Picks</li>
            <li>• ⚾ MLB Weekly Challenge</li>
            <li>• 💥 MLB Home Run Derby</li>
            <li>• 🏒 NHL Weekly Challenge</li>
            <li>• 🏀 NBA Weekly Challenge</li>
            <li>• ⛳ Golf Weekly</li>
            <li>• 🏁 NASCAR Challenge</li>
            <li>• 🧠 Trivia Blitz</li>
	    <li>** Always check back for new challenges **</li>
          </ul>

          <p className="text-slate-400 text-sm">
            For full details, visit the{" "}
            <Link
              href="/challenge-overview"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              Challenge Overview
            </Link>
            .
          </p>
        </section>

        {/* STEP 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3️⃣ Make Your Picks</h2>
          <p className="text-slate-400 leading-relaxed">
            Each challenge has its own pick format. Some require weekly selections,
            others are tournament‑based, and some are one‑time events.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm leading-relaxed">
            <li>• NFL: One pick per week, no repeating teams.</li>
            <li>• MLB/NHL/NBA: Pick weekly series winners.</li>
            <li>• Golf: Pick one golfer each week.</li>
            <li>• NASCAR: Pick one racer each week.</li>
            <li>• Trivia Blitz: Answer timed questions.</li>
            <li>• March Madness: Build up to 4 brackets.</li>
          </ul>

          <p className="text-slate-400 text-sm">
            For scoring details, visit{" "}
            <Link
              href="/scoring"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              How Scoring Works
            </Link>
            .
          </p>
        </section>

        {/* STEP 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4️⃣ Track Your Progress</h2>
          <p className="text-slate-400 leading-relaxed">
            Every challenge contributes to your global BracketBoss ranking. Check the
            leaderboard anytime to see how you stack up across all sports.
          </p>

          <p className="text-slate-400 text-sm">
            Visit the{" "}
            <Link
              href="/leaderboard"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              Leaderboard
            </Link>
            .
          </p>
        </section>

        {/* STEP 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5️⃣ Learn the Rules</h2>
          <p className="text-slate-400 leading-relaxed">
            Each season has deadlines, lock times, mulligan limits, and tie‑breaker
            rules. Make sure you understand them before the action starts.
          </p>

          <p className="text-slate-400 text-sm">
            Read the{" "}
            <Link
              href="/season-rules"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              Season Rules
            </Link>
            .
          </p>
        </section>

        {/* STEP 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">6️⃣ Have Fun & Compete</h2>
          <p className="text-slate-400 leading-relaxed">
            BracketBoss is built for fans who love competition, strategy, and bragging
            rights. Whether you’re chasing a payout, a badge, or the top spot on the
            leaderboard — enjoy the ride.
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
