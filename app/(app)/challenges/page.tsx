import Link from "next/link";

// UI icons stay in lucide-react
import {
  Trophy,
  Brain,
  ListChecks,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// Sports & specialty icons come from @lucide/icons
import {
  Golf,
  Baseball,
  Football,
  Basketball,
  IceCream,
  Sparkles,
} from "@lucide/icons";

export default function ChallengesHub() {
  return (
    <div className="space-y-12 animate-fadeIn">
      {/* ...rest of your file unchanged... */}
    </div>
  );
}
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
          <Sparkles size={18} className="text-emerald-400" />
          Weekly Challenges
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ChallengeItem
            href="/sports/golf/weekly"
            icon={<Golf size={22} />}
            title="Golf Weekly"
            desc="Pick a golfer each week and track your streak."
          />

          <ChallengeItem
            href="/sports/mlb"
            icon={<Baseball size={22} />}
            title="MLB Weekly"
            desc="Choose your top hitter and follow weekly performance."
          />

          <ChallengeItem
            href="/sports/mlb/derby"
            icon={<Baseball size={22} />}
            title="MLB Derby"
            desc="Predict home run leaders in a derby-style challenge."
          />

          <ChallengeItem
            href="/sports/nfl/weekly"
            icon={<Football size={22} />}
            title="NFL Weekly"
            desc="Pick a player each week and build your streak."
          />

          <ChallengeItem
            href="/sports/nba/weekly"
            icon={<Basketball size={22} />}
            title="NBA Weekly"
            desc="Choose a standout performer each week."
          />

          <ChallengeItem
            href="/sports/nhl/weekly"
            icon={<IceCream size={22} />}
            title="NHL Weekly"
            desc="Track weekly picks across the NHL season."
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
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-xl
        border border-white/10
        bg-slate-900/40
        backdrop-blur
        p-5
        shadow-md
        hover:shadow-lg
        hover:border-emerald-400/40
        transition-all
        duration-300
        flex flex-col gap-3
      "
    >
      <div
        className="
          w-12 h-12
          rounded-lg
          bg-slate-800/60
          flex items-center justify-center
          text-slate-200
          group-hover:bg-emerald-500/20
          transition
        "
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
