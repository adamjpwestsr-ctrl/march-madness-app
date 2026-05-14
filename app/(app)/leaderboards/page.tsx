import Link from "next/link";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type Contest = {
  id: string;
  name: string;
  sport: string;
  entry_fee_cents: number;
  mulligan_fee_cents: number;
  rake_percent: number;
  is_active: boolean;
};

type LeaderboardRow = {
  user_id: number;
  username: string;
  total_points: number;
  contests_played: number;
};

type BadgeRule = {
  id: number;
  badge_name: string;
  badge_icon: string | null;
  rule_type: "contests_played" | "total_points";
  threshold: number;
};

type PlayerWithBadges = LeaderboardRow & {
  badges: BadgeRule[];
};

export default async function LeaderboardHub() {
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies }
);

  // Fetch contests
  const { data: sports } = await supabase
    .from<Contest>("contests")
    .select("*")
    .order("name", { ascending: true });

  // Fetch cross-sport leaderboard
  const { data: players } = await supabase
    .from<LeaderboardRow>("leaderboard_all_challenges")
    .select("*")
    .order("total_points", { ascending: false })
    .limit(10);

  // Fetch badge rules
  const { data: badgeRules } = await supabase
    .from<BadgeRule>("badges")
    .select("*");

  const playersWithBadges: PlayerWithBadges[] = (players ?? []).map((p) => {
    const userBadges =
      (badgeRules ?? []).filter((rule) => {
        if (rule.rule_type === "contests_played") {
          return p.contests_played >= rule.threshold;
        }
        if (rule.rule_type === "total_points") {
          return p.total_points >= rule.threshold;
        }
        return false;
      }) ?? [];

    return {
      ...p,
      badges: userBadges,
    };
  });

  return (
    <div className="px-6 pb-20 space-y-16">
      {/* HERO SECTION */}
      <section className="w-full py-12 text-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl">
        <h1 className="text-4xl font-bold tracking-tight">Bracket Boss</h1>
        <p className="text-slate-400 mt-2 text-lg">
          Play. Predict. Win. Across every sport you love.
        </p>
      </section>

      {/* SEASONAL SPOTLIGHT */}
      <section className="mx-auto max-w-4xl rounded-xl p-6 bg-slate-800/40 backdrop-blur border border-slate-700/40">
        <h2 className="text-xl font-semibold">🔥 Golf Weekly — Major Week</h2>
        <p className="text-slate-400">
          Double points this week. Make your picks now.
        </p>
      </section>

      {/* SPORT GRID */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Leaderboards by Sport</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(sports ?? []).map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
        </div>
      </section>

      {/* CROSS-SPORT LEADERBOARD WITH BADGES */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Top Players Across All Sports
        </h2>

        <div className="rounded-xl bg-slate-800/40 backdrop-blur border border-slate-700/40 p-6">
          {playersWithBadges.map((p, i) => (
            <div
              key={p.user_id}
              className="flex items-center justify-between py-3 border-b border-slate-700/40 last:border-none"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {i + 1}. {p.username}
                </span>
                <span className="text-xs text-slate-500">
                  {p.contests_played} contests
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400">{p.total_points} pts</span>
                <div className="flex gap-1">
                  {p.badges.map((b) => (
                    <span
                      key={b.id}
                      className="text-yellow-400 text-lg"
                      title={b.badge_name}
                    >
                      {b.badge_icon ?? "🏅"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BRAGGING WALL */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Bragging Wall</h2>
        <div className="rounded-xl bg-slate-800/40 backdrop-blur border border-slate-700/40 p-6 text-slate-400">
          <p>ForumPanel coming soon — integrated with your admin tools.</p>
        </div>
      </section>
    </div>
  );
}

/* SPORT CARD COMPONENT */
function SportCard({ sport }: { sport: Contest }) {
  return (
    <div className="rounded-xl p-6 bg-slate-800/40 backdrop-blur border border-slate-700/40 hover:bg-slate-800/60 transition">
      <div className="flex items-center gap-3">
        <div className="text-3xl">🏆</div>
        <h3 className="text-xl font-semibold">{sport.name}</h3>
      </div>

      <p className="text-slate-400 mt-2 capitalize">{sport.sport}</p>

      <div className="mt-4 flex justify-between text-sm text-slate-500">
        <span>
          Entry: ${(sport.entry_fee_cents / 100).toFixed(2)}
        </span>
        <span>{sport.is_active ? "Active" : "Inactive"}</span>
      </div>

      <Link
        href={`/leaderboards/${sport.sport}`}
        className="mt-5 block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
      >
        View Leaderboard
      </Link>
    </div>
  );
}
