"use server";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client (service role)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ⭐ APPROVE USER
export async function approveUser(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase();
  if (!email) return;

  // 1. Add to users table
  await supabase.from("users").insert({
    email,
    is_admin: false,
  });

  // 2. Remove from pending_users
  await supabase.from("pending_users").delete().eq("email", email);
}

// ⭐ DENY USER
export async function denyUser(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase();
  if (!email) return;

  // Remove from pending_users
  await supabase.from("pending_users").delete().eq("email", email);
}
