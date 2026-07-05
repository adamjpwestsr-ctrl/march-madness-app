"use client";

import Link from "next/link";

export default function SupportCenterPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-center drop-shadow-lg">
          Support Center
        </h1>

        <p className="text-slate-300 text-center text-lg">
          Everything you need to get started, understand the rules, make picks, and
          compete all season long — all in one place.
        </p>

        {/* GETTING STARTED */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🟩 Getting Started</h2>
          <p className="text-slate-400 leading-relaxed">
            New to BracketBoss? Start here.
          </p>

          <ul className="space-y-2 text-sm text-slate-400 pl-2">
            <li>
              <Link href="/quick-start" className="underline hover:text-slate-300">
                New User Quick Start
              </Link>
            </li>
            <li>
              <Link href="/season-rules" className="underline hover:text-slate-300">
                Season Rules
              </Link>
            </li>
            <li>
              <Link href="/login" className="underline hover:text-slate-300">
                Password‑Free Login Guide
              </Link>
            </li>
          </ul>
        </section>

        {/* CHALLENGES */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🟦 Challenges</h2>
          <p className="text-slate-400 leading-relaxed">
            Learn how each challenge works and what makes them unique.
          </p>

          <ul className="space-y-2 text-sm text-slate-400 pl-2">
            <li>
              <Link href="/challenge-overview" className="underline hover:text-slate-300">
                Challenge Overview
              </Link>
            </li>
            <li>
              <Link href="/scoring" className="underline hover:text-slate-300">
                How Scoring Works
              </Link>
            </li>
          </ul>
        </section>

        {/* TROUBLESHOOTING */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🟨 Troubleshooting</h2>
          <p className="text-slate-400 leading-relaxed">
            Common issues and how to resolve them quickly.
          </p>

          <ul className="space-y-2 text-sm text-slate-400 pl-2">
            <li>• Picks not saving? Ensure you’re logged in and before lock time.</li>
            <li>• Brackets locked? The Opening Round must have started.</li>
            <li>• Weekly picks locked? First game of the week has begun.</li>
            <li>• Trivia not loading? Try refreshing or checking your connection.</li>
            <li>• Email not arriving? Check spam or try resending.</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🟪 Frequently Asked Questions</h2>

          <ul className="space-y-4 text-sm text-slate-400 pl-2 leading-relaxed">
            <li>
              <strong className="text-slate-300">How do I change my picks?</strong><br />
              Picks can be changed anytime before the lock deadline for that challenge.
            </li>

            <li>
              <strong className="text-slate-300">Can I play multiple challenges?</strong><br />
              Yes — you can participate in every challenge all season long.
            </li>

            <li>
              <strong className="text-slate-300">How do Mulligans work?</strong><br />
              Mulligans allow limited early‑round corrections in March Madness.
            </li>

            <li>
              <strong className="text-slate-300">Do all sports count toward my rank?</strong><br />
              Yes — all challenge points contribute to your global leaderboard score.
            </li>
          </ul>
        </section>

        {/* CONTACT */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🟫 Contact the Commissioners</h2>
          <p className="text-slate-400 leading-relaxed">
            Need help? Have a question? Want to report an issue?
          </p>

          <a
            href="mailto:commissioners@yourdomain.com"
            className="underline text-emerald-400 hover:text-emerald-300 text-sm"
          >
            commissioners@yourdomain.com
          </a>
        </section>

        {/* ADMIN TOOLS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🟧 Commissioner Tools</h2>
          <p className="text-slate-400 leading-relaxed">
            Admin access is required to manage seasons, scoring, and player data.
          </p>

          <Link
            href="/admin"
            className="underline text-emerald-400 hover:text-emerald-300 text-sm"
          >
            Go to Admin Dashboard
          </Link>
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
