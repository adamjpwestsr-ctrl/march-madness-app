import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function EditOpeningRoundSlot({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();   // ✅ FIXED

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),   // ✅ FIXED
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);   // ✅ FIXED
          });
        },
      },
    }
  );

  const { data: slot } = await supabase
    .from("opening_round_slots")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: r64Games } = await supabase
    .from("games")
    .select("*")
    .eq("round", "Round of 64")
    .order("game_number");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Edit Opening Round Mapping</h1>

      <form
        action="/api/opening-round-slot/update"
        method="POST"
        className="space-y-4"
      >
        <input type="hidden" name="id" value={slot.id} />

        <div>
          <label>Region</label>
          <select name="target_region" defaultValue={slot.target_region}>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="South">South</option>
            <option value="Midwest">Midwest</option>
          </select>
        </div>

        <div>
          <label>Seed</label>
          <input
            type="number"
            name="target_seed"
            defaultValue={slot.target_seed}
          />
        </div>

        <div>
          <label>Round of 64 Game</label>
          <select
            name="round_of_64_game_id"
            defaultValue={slot.round_of_64_game_id}
          >
            {r64Games?.map((g) => (
              <option key={g.id} value={g.id}>
                Game {g.game_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Slot</label>
          <select name="slot_position" defaultValue={slot.slot_position}>
            <option value={1}>Team 1</option>
            <option value={2}>Team 2</option>
          </select>
        </div>

        <button className="p-2 bg-blue-600 rounded-lg">Save Changes</button>
      </form>
    </div>
  );
}
