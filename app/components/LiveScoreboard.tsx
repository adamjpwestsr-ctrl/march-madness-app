import { Trophy } from "lucide-react";

export default async function LiveScoreboard() {
  // ESPN NBA scoreboard (you can swap this for NFL/MLB/NHL)
  const res = await fetch(
    "https://site.api.espn.com/apis/v2/sports/basketball/nba/scoreboard",
    {
      next: { revalidate: 60 }, // refresh every 60 seconds
    }
  );

  if (!res.ok) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-slate-400">
        Unable to load live scores.
      </div>
    );
  }

  const data = await res.json();
  const events = data?.events || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-5 shadow-lg space-y-4">
      <div className="flex items-center gap-2">
        <Trophy size={18} className="text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Live Scores</h2>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {events.length === 0 && (
          <p className="text-slate-400 text-sm">No live games right now.</p>
        )}

        {events.map((game: any) => {
          const comp = game.competitions?.[0];
          const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
          const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

          return (
            <div
              key={game.id}
              className="min-w-[220px] rounded-xl bg-slate-800/60 border border-white/5 p-4 shadow hover:shadow-md transition-all"
            >
              <p className="text-xs text-slate-400 mb-2">{game.shortName}</p>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">{away?.team?.abbreviation}</span>
                  <span className="text-white font-semibold">{away?.score}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">{home?.team?.abbreviation}</span>
                  <span className="text-white font-semibold">{home?.score}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                {game.status?.type?.shortDetail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
