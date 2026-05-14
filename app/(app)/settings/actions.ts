"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

// Fetch user profile
export async function getUserProfile(userId: number) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      "user_id, username, email, favorite_sport, theme, email_notifications, push_notifications"
    )
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Update user profile
export async function updateUserProfile(
  userId: number,
  updates: Partial<{
    username: string;
    favorite_sport: string;
    theme: string;
    email_notifications: boolean;
    push_notifications: boolean;
  }>
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("users").update(updates).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { message: "Profile updated successfully." };
}

// Auto‑generate username from email prefix
export async function initializeUsername(userId: number) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("email, username")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  if (data.username) return data.username;

  const prefix = data.email?.split("@")[0] ?? "user";
  const { error: updateErr } = await supabase
    .from("users")
    .update({ username: prefix })
    .eq("user_id", userId);

  if (updateErr) throw new Error(updateErr.message);
  return prefix;
}
