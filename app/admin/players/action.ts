"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function toggleActive(id: number) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("user_challenge_status")
    .update({ is_active: supabase.rpc("not", { value: "is_active" }) })
    .eq("id", id);
}

export async function togglePaid(id: number) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("user_challenge_status")
    .update({
      has_paid: supabase.rpc("not", { value: "has_paid" }),
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);
}
