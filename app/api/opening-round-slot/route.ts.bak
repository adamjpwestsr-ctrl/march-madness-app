import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {}
      }
    }
  );

const { error } = await supabase.from("opening_round_slots").insert({
  opening_round_game_id: body.opening_round_game_id,
  target_region: body.target_region,
  target_seed: body.target_seed,
  round_of_64_game_id: body.round_of_64_game_id,
  slot_position: body.slot_position,
  auto_suggested: body.auto_suggested ?? false,
});

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
