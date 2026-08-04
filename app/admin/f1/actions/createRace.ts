"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async async function createF1Race(name: string, date: string, circuit: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("f1_races").insert({
    name,
    date,
    circuit,
  });

  if (error) return { success: false, error };
  return { success: true };
}
