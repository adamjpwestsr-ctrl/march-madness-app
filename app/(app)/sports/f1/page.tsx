import F1DriverSelection from "@/app/components/F1DriverSelection";
import F1LiveLeaderboard from "@/app/(app)/sports/f1/F1LiveLeaderboard";
import { getF1Leaderboard, getF1Drivers } from "@/app/api/f1/actions";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const dynamic = "force-dynamic";

export default async function F1Dashboard() {
  const supabase = await createSupabaseServerClient();

  // 1. Get next F1 race
  const { data: nextRace } = await supabase
    .from("f1_races")
    .select("*")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(1)
    .single();

  // 2. Get drivers
  const drivers = await getF1Drivers();

  // 3. Get user pick
  const session = await supabase.auth.getUser();
  const userId = session.data.user?.id;

  const { data: pick } = await supabase
    .from("f1_picks")
    .select("driver_id")
    .eq("user_id", userId)
    .eq("race_id", nextRace?.race_id)
    .single();

  // 4. Leaderboard preview
  const leaderboard = await getF1Leaderboard(nextRace?.race_id);

  // Helper: find driver name for pick
const pickedDriverName = pick
  ? (drivers ?? []).find((d: any) => d.driver_id === pick.driver_id)?.driver_name
  : null;

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto px-4">

      {/* Next Race */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">🏁 Next F1 Grand Prix</h2>

        {nextRace ? (
          <>
            <p className="text-slate-300 text-lg font-medium">{nextRace.name}</p>
            <p className="text-slate-400">{nextRace.date}</p>
            <p className="text-slate-400">Circuit: {nextRace.circuit}</p>
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
            You picked {pickedDriverName ?? pick.driver_id}
          </p>
        ) : (
          <p className="text-slate-400">You haven't picked a driver yet.</p>
        )}
      </section>

      {/* Driver Selection */}
      <F1DriverSelection
        race={nextRace}
        drivers={drivers || []}
        userId={userId ?? ""}
      />

      {/* 🔥 LIVE LEADERBOARD PANEL */}
      {nextRace && (
        <F1LiveLeaderboard raceId={nextRace.race_id} />
      )}

      {/* Leaderboard Preview */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">🏆 Leaderboard</h2>

        <div className="space-y-2">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((row: any, i: number) => (
              <div key={i} className="flex justify-between text-slate-300">
                <span>{row.user_id}</span>
                <span className="font-semibold">{row.points} pts</span>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No leaderboard data available yet.</p>
          )}
        </div>

        <a
          href="/f1/leaderboard"
          className="text-emerald-400 underline mt-4 inline-block"
        >
          View full leaderboard →
        </a>
      </section>

      {/* Race History */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">📜 Race History</h2>
        <a
          href="/f1/history"
          className="text-emerald-400 underline"
        >
          View past races →
        </a>
      </section>
    </div>
  );
}
