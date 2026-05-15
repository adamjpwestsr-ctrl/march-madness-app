import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const form = await req.formData();

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

  const { error } = await supabase
    .from("opening_round_slots")
    .update({
      target_region: form.get("target_region"),
      target_seed: Number(form.get("target_seed")),
      round_of_64_game_id: form.get("round_of_64_game_id"),
      slot_position: Number(form.get("slot_position")),
    })
    .eq("id", form.get("id"));

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.redirect("/admin/opening-round");
}
