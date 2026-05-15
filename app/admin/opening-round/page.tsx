import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { OpeningRoundAdmin } from "./OpeningRoundAdmin";
import { OpeningRoundSlotEditor } from "./OpeningRoundSlotEditor";

export default async function OpeningRoundAdminPage() {
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

  // Load Opening Round games
  const { data: openingRoundGames } = await supabase
    .from("games")
    .select("*, team1:team1_id(name), team2:team2_id(name)")
    .eq("round", "Opening Round")
    .order("game_number");

  // Load Round of 64 games
  const { data: r64Games } = await supabase
    .from("games")
    .select("*")
    .eq("round", "Round of 64")
    .order("game_number");

  // Load all teams
  const { data: allTeams } = await supabase
    .from("teams")
    .select("*");

  // FIX: Normalize null → []
  const safeR64Games = r64Games ?? [];
  const safeAllTeams = allTeams ?? [];

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold">Opening Round Admin</h1>

      {/* Winner Selection */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Select Winners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {openingRoundGames?.map((g) => (
            <OpeningRoundAdmin key={g.id} game={g} />
          ))}
        </div>
      </section>

      {/* Slot Mapping */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Map Opening Round Slots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {openingRoundGames?.map((g) => (
            <OpeningRoundSlotEditor
              key={g.id}
              game={g}
              r64Games={safeR64Games}
              allTeams={safeAllTeams}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
