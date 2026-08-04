import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const dynamic = "force-dynamic";

export default async async function F1HistoryPage() {
  const supabase = await createSupabaseServerClient();

  const { data: races } = await supabase
    .from("f1_races")
    .select("*")
    .order("date", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold text-white">📜 F1 Race History</h1>

      <div className="space-y-3">
        {races && races.length > 0 ? (
          races.map((race: any) => (
            <div
              key={race.race_id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
            >
              <p className="text-slate-100 font-semibold">{race.name}</p>
              <p className="text-slate-400 text-sm">{race.date}</p>
              <p className="text-slate-500 text-sm">Circuit: {race.circuit}</p>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No races recorded yet.</p>
        )}
      </div>
    </div>
  );
}
