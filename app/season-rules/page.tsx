"use client";

import Link from "next/link";

export default function SeasonRulesPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-center drop-shadow-lg">
          Season Rules
        </h1>

        <p className="text-slate-300 text-center text-lg">
          Every BracketBoss season follows a consistent set of rules to ensure fairness,
          competitive balance, and a great experience for all players.
        </p>

        {/* SECTION: DEADLINES */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">⏰ Pick Deadlines</h2>
          <p className="text-slate-400 leading-relaxed">
            Each challenge has a strict deadline for submitting picks. Once the deadline
            passes, picks lock and cannot be changed.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• NFL Weekly: Picks lock at kickoff of the first Sunday game.</li>
            <li>• MLB/NHL/NBA Weekly: Picks lock at the start of the first series game.</li>
            <li>• Golf Weekly: Picks lock at the first tee time on Thursday.</li>
            <li>• NASCAR: Picks lock at the start of the race.</li>
            <li>• March Madness: Brackets lock before the first Opening Round game.</li>
            <li>• Trivia Blitz: Timed sessions lock when the round begins.</li>
          </ul>
        </section>

        {/* SECTION: MULLIGANS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">♻️ Mulligans</h2>
          <p className="text-slate-400 leading-relaxed">
            Mulligans allow limited corrections to early March Madness picks. They are
            exclusive to BracketBoss and must be used before the Sweet 16.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Only available for March Madness.</li>
            <li>• Must be used before the Sweet 16 begins.</li>
            <li>• Limited number per season.</li>
            <li>• Mulligan picks earn reduced seed bonus points.</li>
          </ul>
        </section>

        {/* SECTION: SCORING CONSISTENCY */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">📏 Scoring Consistency</h2>
          <p className="text-slate-400 leading-relaxed">
            All scoring systems are fixed for the duration of the season. Scoring rules
            for each sport can be found on the{" "}
            <Link
              href="/scoring"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              How Scoring Works
            </Link>{" "}
            page.
          </p>
        </section>

        {/* SECTION: TIEBREAKERS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">⚖️ Tie‑Breakers</h2>
          <p className="text-slate-400 leading-relaxed">
            If players finish with identical scores, tie‑breakers determine final
            placement.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Most correct picks across the season.</li>
            <li>• Best performance in the final week.</li>
            <li>• Highest single‑week score.</li>
            <li>• Earliest submission (for March Madness brackets).</li>
          </ul>
        </section>

        {/* SECTION: FAIR PLAY */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🤝 Fair Play & Integrity</h2>
          <p className="text-slate-400 leading-relaxed">
            BracketBoss is built on fairness. All players must follow the rules and
            respect pick deadlines. Any attempt to manipulate scoring, exploit timing,
            or circumvent rules may result in disqualification.
          </p>
        </section>

        {/* SECTION: PAYOUTS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">💰 Payouts & Prizes</h2>
          <p className="text-slate-400 leading-relaxed">
            Some challenges offer payouts or prizes. Payout structures are announced
            before each season begins and remain fixed throughout the season.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• March Madness: Large payout for top finishers.</li>
            <li>• Weekly Challenges: Prizes vary by sport.</li>
            <li>• Trivia Blitz: Bonus rewards for streaks and top scores.</li>
          </ul>
        </section>

        {/* SECTION: GLOBAL LEADERBOARD */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">📊 Global Leaderboard Rules</h2>
          <p className="text-slate-400 leading-relaxed">
            All challenge points contribute to your global BracketBoss ranking. The
            leaderboard updates live as events progress.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Points from all sports count toward your rank.</li>
            <li>• Rankings update automatically.</li>
            <li>• Season champions earn special badges.</li>
          </ul>
        </section>

        {/* SECTION: ACCOUNT RULES */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🔐 Account Rules</h2>
          <p className="text-slate-400 leading-relaxed">
            BracketBoss uses password‑free login. Your email is your secure key. You
            must use the same email throughout the season to maintain your scores.
          </p>

          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• One account per player.</li>
            <li>• Email must remain consistent.</li>
            <li>• Admin codes are required for commissioner access.</li>
          </ul>
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
