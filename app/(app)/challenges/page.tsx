//page.tsx
import Link from "next/link";
import {
  Trophy,
  Brain,
  Star,
  Flag,
  Goal,
  Circle,
  CircleDot,
  Medal,
} from "lucide-react";

export default function ChallengesHub() {
  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Challenges</h1>
        <p className="text-slate-400">
          Explore weekly sports challenges, trivia modes, and special events.
        </p>
      </section>

      {/* Weekly Challenges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <Star size={18} className="text-emerald-400" />
          Weekly Challenges
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ChallengeItem
            href="/sports/golf/weekly"
            icon={<Flag size={22} />}
            title="Golf Weekly"
            desc="Pick a golfer each week and track your streak."
            color="emerald"
          />

          <ChallengeItem
            href="/sports/mlb"
            icon={<Circle size={22} />}
            title="MLB Weekly"
            desc="Choose your top hitter and follow weekly performance."
            color="amber"
          />

          <ChallengeItem
            href="/sports/nfl/weekly"
            icon={<Goal size={22} />}
            title="NFL Weekly"
            desc="Pick a player each week and build your streak."
            color="red"
          />

          <ChallengeItem
            href="/sports/nba/weekly"
            icon={<CircleDot size={22} />}
            title="NBA Weekly"
            desc="Choose a standout performer each week."
            color="sky"
          />

          <ChallengeItem
            href="/sports/nhl/weekly"
            icon={<Goal size={22} />}
            title="NHL Weekly"
            desc="Track weekly picks across the NHL season."
            color="blue"
          />

          {/* ⭐ NEW NASCAR WEEKLY CHALLENGE */}
          <ChallengeItem
            href="/sports/nascar"
            icon={<Flag size={22} />}
            title="NASCAR Weekly"
            desc="Pick a driver each race and track your season performance."
            color="rose"
          />
        </div>
      </section>

      {/* Special Challenges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          Special Challenges
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ChallengeItem
            href="/sports/march-madness"
            icon={<Trophy size={22} />}
            title="March Madness"
            desc="Build your bracket and compete for the top spot."
            color="fuchsia"
          />

          <ChallengeItem
            href="/sports/mlb/derby"
            icon={<Medal size={22} />}
            title="MLB Derby"
            desc="Predict home run leaders in a derby-style challenge."
            color="yellow"
          />
        </div>
      </section>

      {/* Trivia */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <Brain size={18} className="text-blue-400" />
          Trivia Challenges
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ChallengeItem
            href="/challenges/weekly"
            icon={<Brain size={22} />}
            title="Weekly Trivia"
            desc="A new themed trivia challenge every week."
            color="sky"
          />
        </div>
      </section>
    </div>
  );
}

/* ------------------------------
   Reusable Challenge Item
------------------------------ */
function ChallengeItem({
  href,
  icon,
  title,
  desc,
  color = "emerald",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "group-hover:border-emerald-400/40 group-hover:bg-emerald-500/10",
    amber: "group-hover:border-amber-400/40 group-hover:bg-amber-500/10",
    red: "group-hover:border-red-400/40 group-hover:bg-red-500/10",
    sky: "group-hover:border-sky-400/40 group-hover:bg-sky-500/10",
    blue: "group-hover:border-blue-400/40 group-hover:bg-blue-500/10",
    fuchsia: "group-hover:border-fuchsia-400/40 group-hover:bg-fuchsia-500/10",
    yellow: "group-hover:border-yellow-400/40 group-hover:bg-yellow-500/10",

    // ⭐ NEW NASCAR COLOR
    rose: "group-hover:border-rose-400/40 group-hover:bg-rose-500/10",
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
