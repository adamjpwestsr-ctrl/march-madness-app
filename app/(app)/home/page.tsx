import Link from "next/link";
import WeeklyBanner from "@/app/components/WeeklyBanner";
import TodayTrivia from "@/app/components/TodayTrivia";
import FeaturedSports from "@/app/components/FeaturedSports";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getUserProfile, initializeUsername } from "@/app/(app)/settings/actions";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  // Get the current authenticated user (Supabase Auth)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-white p-10 text-center">
        <p>You are not logged in.</p>
        <a href="/login" className="text-emerald-400 underline">
          Go to Login
        </a>
      </div>
    );
  }

  // ⭐ FIRST: Look up internal user record using auth_id
  const { data: internal } = await supabase
    .from("users")
    .select("user_id, email")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!internal?.user_id) {
    return (
      <div className="text-white p-10 text-center">
        <p>Profile not found.</p>
      </div>
    );
  }

  const internalUserId: number = internal.user_id;

  // ⭐ Use the same logic as SettingsPage
  const profile = await getUserProfile(internalUserId);
  const finalUsername =
    profile.username || (await initializeUsername(internalUserId));

  // ⭐ Display name priority (no profile.name — it does not exist)
  const displayName =
    finalUsername?.trim() ||
    internal?.email?.split("@")[0] ||
    "Player";

  return (
    <div className="space-y-10">
      {/* Hero / Welcome */}
      <section>
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-emerald-700/30 p-6 md:p-8 shadow-lg shadow-emerald-900/30">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400 mb-2">
            Welcome back
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            {displayName}, your next sports challenge is waiting.
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Play brackets, weekly picks, and trivia across your favorite
            sports—all in one place, all year long.
          </p>
        </div>
      </section>

      {/* Top row */}
      <section className="grid gap-6 md:grid-cols-2">
        <Link href="/challenges" className="block">
          <WeeklyBanner />
        </Link>

        <Link href="/trivia" className="block">
          <TodayTrivia />
        </Link>
      </section>

      {/* Featured Sports */}
      <section>
        <Link href="/sports" className="block">
          <FeaturedSports />
        </Link>
      </section>

      {/* Footer */}
      <section className="border-t border-slate-800 pt-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-300">
              Powered by BracketBoss: Built for fans who never want the season to end.
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">Sponsor space:</span>{" "}
            Non-intrusive partner logos can live here.
          </div>
        </div>
      </section>
    </div>
  );
}
