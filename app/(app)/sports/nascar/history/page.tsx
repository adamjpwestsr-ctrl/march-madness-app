import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export default async function NascarHistoryPage() {
  const supabase = await createSupabaseServerClient();

  // Get all completed races (past dates)
  const { data: races } = await supabase
    .from("nascar_races")
    .select("*")
    .lt("date", new Date().toISOString())
    .order("date", { ascending: false });

  // Get user info
  const session = await supabase.auth.getUser();
  const userId = session.data.user?.id;

  // Get user picks and points
  const { data: picks } = await supabase
    .from("nascar_points")
    .select("race_id, driver_id, points")
    .eq("user_id", userId);

  const pickMap = new Map(picks?.map((p) => [p.race_id, p]) || []);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 space-y-10">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">📜 NASCAR Race History</h1>
        <p className="text-slate-400 mb-6">
          Review your past picks and points earned across all completed NASCAR races.
        </p>

        {races?.length ? (
          <div className="space-y-4">
            {races.map((race) => {
              const pick = pickMap.get(race.id);
              return (
                <div
                  key={race.id}
                  className="flex justify-between items-center border border-slate-700 rounded-lg p-4 bg-slate-800/40"
                >
                  <div>
                    <p className="text-white font-semibold">{race.name}</p>
                    <p className="text-slate-400 text-sm">{race.date}</p>
                    <p className="text-slate-500 text-xs">Stages: {race.stages}</p>
                  </div>

                  <div className="text-right">
                    {pick ? (
                      <>
                        <p className="text-emerald-400 font-medium">
                          Picked: {pick.driver_id}
                        </p>
                        <p className="text-slate-300 text-sm">
                          Points: {pick.points}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-500 text-sm italic">
                        No pick recorded
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400">No completed races yet.</p>
        )}
      </section>
    </div>
  );
}
