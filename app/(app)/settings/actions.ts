"use server";

import { supabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Fetch user profile by auth_id (Supabase Auth user ID)
 */
export async function getUserProfile(authId: string) {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      "user_id, auth_id, username, email, favorite_sport, theme, email_notifications, push_notifications, phone_number"
    )
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update user profile by auth_id
 */
export async function updateUserProfile(
  authId: string,
  updates: Partial<{
    username: string;
    favorite_sport: string;
    theme: string;
    email_notifications: boolean;
    push_notifications: boolean;
    phone_number: string;
    fcm_token: string;
  }>
) {
  const supabase = supabaseServerClient();

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("auth_id", authId);

  if (error) throw new Error(error.message);

  return { message: "Profile updated successfully." };
}

/**
 * Auto‑generate username from email prefix if missing
 */
export async function initializeUsername(authId: string) {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("email, username")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  // If no row found, bail out safely
  if (!data) return "user";

  // If username already exists, return it
  if (data.username) return data.username;

  // Safe email prefix extraction
  const prefix = data.email?.split("@")[0] ?? "user";

  const { error: updateErr } = await supabase
    .from("users")
    .update({ username: prefix })
    .eq("auth_id", authId);

  if (updateErr) throw new Error(updateErr.message);

  return prefix;
}

/**
 * Fetch badges (not user‑specific)
 */
export async function getUserBadges() {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from("badges")
    .select(
      "badge_name, badge_icon, rule_type, threshold, tier, color_class"
    )
    .order("threshold", { ascending: true });

  if (error) throw new Error(error.message);

  return data;
}

