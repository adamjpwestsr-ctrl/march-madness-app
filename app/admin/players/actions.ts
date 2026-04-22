"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

// Toggle ACTIVE
export async function toggleActive(id: number) {
  const supabase = await createSupabaseServerClient();

  const { data: row, error } = await supabase
    .from("user_challenge_status")
    .select("is_active")
    .eq("id", id)
    .single();

  if (error || !row) {
    console.error("toggleActive: row not found", error);
    return;
  }

  await supabase
    .from("user_challenge_status")
    .update({ is_active: !row.is_active })
    .eq("id", id);
}

// Toggle PAID
export async function togglePaid(id: number) {
  const supabase = await createSupabaseServerClient();

  const { data: row, error } = await supabase
    .from("user_challenge_status")
    .select("has_paid")
    .eq("id", id)
    .single();

  if (error || !row) {
    console.error("togglePaid: row not found", error);
    return;
  }

  await supabase
    .from("user_challenge_status")
    .update({
      has_paid: !row.has_paid,
      paid_at: !row.has_paid ? new Date().toISOString() : null,
    })
    .eq("id", id);
}

// Add user to contest
export async function addUserToContest(userId: string, contestId: string) {
  const supabase = await createSupabaseServerClient();

  await supabase.from("user_challenge_status").insert({
    user_id: Number(userId),
    contest_id: contestId,
    is_active: true,
    has_paid: false,
  });
}
