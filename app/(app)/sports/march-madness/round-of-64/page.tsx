import { createServerClient } from "@supabase/auth-helpers-nextjs";

export default async function RoundOf64Page() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {}
      }
    }
  );

  // Load Round of 64 games
  const { data: games } = await supabase
    .from("games")
    .select("*, team1:team1_id(name), team2:team2_id(name)")
    .eq("round", "Round of 64")
    .order("game_number");

  // Load Opening Round mappings
  const { data: slots } = await supabase
    .from("tournament_games").eq("round", 1)
    .select("*");

  // Define regions
  const regions = ["East", "West", "South", "Midwest"];

  // Strongly typed grouped structure
  type GroupedGames = Record<
    string,
    { game: any; slot: any }[]
  >;

  const grouped: GroupedGames = {
    East: [],
    West: [],
    South: [],
    Midwest: [],
  };

  // Group games by region
  games?.forEach((g) => {
    const slot = slots?.find((s) => s.round_of_64_game_id === g.id);
    const region = slot?.target_region ?? "Unassigned";

    if (!grouped[region]) grouped[region] = [];

    grouped[region].push({ game: g, slot });
  });

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold">Round of 64</h1>

      {regions.map((region) => (
        <div key={region} className="space-y-4">
          <h2 className="text-2xl font-semibold">{region} Region</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {grouped[region].map(({ game: g, slot }) => {
              const team1Assigned = Boolean(g.team1?.name);
              const team2Assigned = Boolean(g.team2?.name);
              const isAutoSuggested = slot?.auto_suggested === true;

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">
                      Game {g.game_number}
                    </h3>

                    {/* Clickable badge */}
                    {slot && (
                      <a
                        href={`/admin/opening-round/edit/${slot.id}`}
                        className={`text-xs px-2 py-1 rounded ${
                          isAutoSuggested
                            ? "bg-purple-600 text-white"
                            : "bg-blue-600 text-white"
                        } hover:opacity-80`}
                      >
                        {isAutoSuggested ? "Auto‑Suggested" : "Manual"}
                      </a>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* TEAM 1 */}
                    <div className="p-2 rounded bg-slate-900/40 border border-slate-700/40">
                      <strong>Team 1:</strong>{" "}
                      {team1Assigned ? (
                        <span className="text-green-400">{g.team1.name}</span>
                      ) : (
                        <a
                          href={`/admin/opening-round?game=${slot?.opening_round_game_id}`}
                          className="text-yellow-400 underline hover:text-yellow-300"
                        >
                          Placeholder — Winner of Opening Round Game{" "}
                          {slot?.opening_round_game_id}
                        </a>
                      )}
                    </div>

                    {/* TEAM 2 */}
                    <div className="p-2 rounded bg-slate-900/40 border border-slate-700/40">
                      <strong>Team 2:</strong>{" "}
                      {team2Assigned ? (
                        <span className="text-green-400">{g.team2.name}</span>
                      ) : (
                        <a
                          href={`/admin/opening-round?game=${slot?.opening_round_game_id}`}
                          className="text-yellow-400 underline hover:text-yellow-300"
                        >
                          Placeholder — Winner of Opening Round Game{" "}
                          {slot?.opening_round_game_id}
                        </a>
                      )}
                    </div>

                    {/* Seed */}
                    {slot && (
                      <div className="text-sm text-slate-400 mt-2">
                        <strong>Seed:</strong> {slot.target_seed}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
