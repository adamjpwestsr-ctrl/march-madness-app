import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const form = await req.formData();

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: cookieStore });

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
