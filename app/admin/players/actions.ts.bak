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

// Add user to one or many contests
export async function addUserToContest(
  userId: string,
  contestIds: string[]
) {
  const supabase = await createSupabaseServerClient();

  const numericUserId = Number(userId);
  if (!numericUserId || contestIds.length === 0) return;

  // Fetch existing rows to avoid duplicates
  const { data: existing, error } = await supabase
    .from("user_challenge_status")
    .select("contest_id")
    .eq("user_id", numericUserId)
    .in("contest_id", contestIds);

  if (error) {
    console.error("addUserToContest: fetch existing error", error);
  }

  const existingIds = new Set((existing || []).map((r) => r.contest_id));

  const toInsert = contestIds
    .filter((id) => !existingIds.has(id))
    .map((contestId) => ({
      user_id: numericUserId,
      contest_id: contestId,
      is_active: true,
      has_paid: false,
    }));

  if (toInsert.length === 0) return;

  const { error: insertError } = await supabase
    .from("user_challenge_status")
    .insert(toInsert);

  if (insertError) {
    console.error("addUserToContest: insert error", insertError);
  }
}
