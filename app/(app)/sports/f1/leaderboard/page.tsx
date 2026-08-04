import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getF1Leaderboard } from "@/app/api/f1/actions";

export const dynamic = "force-dynamic";

export default async function F1LeaderboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: races } = await supabase
    .from("f1_races")
    .select("*")
    .order("date", { ascending: true });

  const latestRace = races?.[races.length - 1] ?? null;
  const leaderboard = await getF1Leaderboard(latestRace?.race_id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold text-white">🏆 F1 Leaderboard</h1>

      {latestRace && (
        <p className="text-slate-300">
          Latest race: <span className="font-semibold">{latestRace.name}</span>
        </p>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-2">
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((row: any, i: number) => (
            <div
              key={i}
              className="flex justify-between text-slate-300 text-sm"
            >
              <span>{row.user_id}</span>
              <span className="font-semibold">{row.points} pts</span>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No leaderboard data available yet.</p>
        )}
      </div>
    </div>
  );
}
