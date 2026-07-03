import NascarDriverSelection from "@/app/components/NascarDriverSelection";
import NascarLiveLeaderboard from "@/app/(app)/sports/nascar/NascarLiveLeaderboard";
import { getNascarLeaderboard } from "@/app/api/nascar/route";
import { createClient } from "@/lib/supabaseServerClient";

export default async function NascarDashboard() {
  const supabase = createClient();

  // 1. Get next race
  const { data: nextRace } = await supabase
    .from("nascar_races")
    .select("*")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(1)
    .single();

  // 2. Get drivers (from ESPN or your static list)
  const { data: drivers } = await supabase
    .from("nascar_drivers")
    .select("*")
    .order("driver_name", { ascending: true });

  // 3. Get user pick
  const session = await supabase.auth.getUser();
  const userId = session.data.user?.id;

  const { data: pick } = await supabase
    .from("nascar_picks")
    .select("*")
    .eq("user_id", userId)
    .eq("race_id", nextRace?.id)
    .single();

  // 4. Leaderboard preview
  const leaderboard = await getNascarLeaderboard();

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto px-4">

      {/* Next Race */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">🏁 Next NASCAR Race</h2>

        {nextRace ? (
          <>
            <p className="text-slate-300 text-lg font-medium">{nextRace.name}</p>
            <p className="text-slate-400">{nextRace.date}</p>
            <p className="text-slate-400">Stages: {nextRace.stages}</p>
          </>
        ) : (
          <p className="text-slate-400">No upcoming race found.</p>
        )}
      </section>

      {/* Your Pick */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">🎯 Your Pick</h2>

        {pick ? (
          <p className="text-emerald-400 text-lg font-medium">
            You picked {pick.driver_id}
          </p>
        ) : (
          <p className="text-slate-400">You haven't picked a driver yet.</p>
        )}
      </section>

      {/* Driver Selection */}
      <NascarDriverSelection
        race={nextRace}
        drivers={drivers || []}
        userId={userId}
      />

      {/* 🔥 LIVE LEADERBOARD PANEL */}
      {nextRace && (
        <NascarLiveLeaderboard raceId={nextRace.id} />
      )}

      {/* Leaderboard Preview */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">🏆 Leaderboard</h2>

        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((row: any, i: number) => (
            <div key={i} className="flex justify-between text-slate-300">
              <span>{row.user_id}</span>
              <span className="font-semibold">{row.total_points} pts</span>
            </div>
          ))}
        </div>

        <a
          href="/nascar/leaderboard"
          className="text-emerald-400 underline mt-4 inline-block"
        >
          View full leaderboard →
        </a>
      </section>

      {/* Race History */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">📜 Race History</h2>
        <a
          href="/nascar/history"
          className="text-emerald-400 underline"
        >
          View past races →
        </a>
      </section>
    </div>
  );
}
