import Link from "next/link";
import { Flag, Goal, Lock, ChevronRight } from "lucide-react";
import NcaafTicker from "@/app/components/NcaafTicker";

export default function NcaafLandingPage() {
  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto px-4 animate-fadeIn">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">NCAA Football</h1>
        <p className="text-slate-400">
          Weekly pick challenges, live scores, bowl games, and CFP bracket.
        </p>
      </section>

      {/* ⭐ ESPN‑Style Ticker Container (Home‑style wrapper applied) */}
      <section className="z-20 w-full bg-slate-950/90 backdrop-blur border-y border-slate-800 overflow-x-hidden overflow-y-visible relative rounded-xl">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />

        {/* Right Fade */}
        <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />

        {/* ⭐ This wrapper was missing — now the marquee stays inside bounds */}
        <div className="overflow-hidden w-full">
          <NcaafTicker />
        </div>
      </section>

      {/* Weekly Pick Modes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <Goal size={20} className="text-yellow-400" />
          Weekly Pick Challenges
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PickCard
            href="/sports/ncaaf/weekly/all"
            title="All Matchups"
            desc="Pick winners for every NCAA Football game this week."
            icon={<Goal size={22} />}
            color="yellow"
          />

          <PickCard
            href="/sports/ncaaf/weekly/top25"
            title="Top 25 Matchups"
            desc="Pick winners from ranked matchups only."
            icon={<Flag size={22} />}
            color="sky"
          />

          <PickCard
            href="/sports/ncaaf/weekly/conference"
            title="By Conference"
            desc="Choose a conference and pick winners from its weekly slate."
            icon={<ChevronRight size={22} />}
            color="emerald"
          />
        </div>
      </section>

      {/* Leaderboard */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <Goal size={20} className="text-emerald-400" />
          Leaderboard
        </h2>

        <Link
          href="/sports/ncaaf/leaderboard"
          className="group rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur p-5
                     shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3
                     active:scale-[0.97] active:shadow-sm"
        >
          <Goal size={26} className="text-emerald-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">NCAA Football Leaderboard</h3>
            <p className="text-slate-400 text-sm">
              Track weekly points and season standings.
            </p>
          </div>
        </Link>
      </section>

      {/* Bowl Games + CFP */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <Flag size={20} className="text-red-400" />
          Postseason Challenges
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <LockedCard
            title="Bowl Game Selections"
            desc="Unlocks once all bowl matchups are announced."
          />

          <LockedCard
            title="College Football Playoff Bracket"
            desc="Unlocks once the 12-team CFP bracket is set."
          />
        </div>
      </section>
    </div>
  );
}

/* ------------------------------
   Pick Card Component
------------------------------ */
function PickCard({
  href,
  title,
  desc,
  icon,
  color = "yellow",
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    yellow: "group-hover:border-yellow-400/40 group-hover:bg-yellow-500/10",
    sky: "group-hover:border-sky-400/40 group-hover:bg-sky-500/10",
    emerald: "group-hover:border-emerald-400/40 group-hover:bg-emerald-500/10",
  };

  return (
    <Link
      href={href}
      className={`
        group rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur p-5
        shadow-md hover:shadow-lg transition-all duration-300 flex flex-col gap-3
        active:scale-[0.97] active:shadow-sm
        ${colorMap[color]}
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-lg bg-slate-800/60 flex items-center justify-center
          text-slate-200 transition active:scale-95
          ${colorMap[color]}
        `}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
    </Link>
  );
}

/* ------------------------------
   Locked Card Component
------------------------------ */
function LockedCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div
      className={`
        rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur p-5
        shadow-md flex flex-col gap-3 opacity-60 cursor-not-allowed
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-lg bg-slate-800/60 flex items-center justify-center
          text-slate-200
        `}
      >
        <Lock size={22} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}
