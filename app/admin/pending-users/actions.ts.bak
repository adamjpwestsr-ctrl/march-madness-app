"use server";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ⭐ APPROVE USER
export async function approveUser(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase();
  if (!email) return;

  // 1. Add to users table
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .upsert({ email, is_admin: false })
    .select()
    .maybeSingle();

  if (userError) {
    console.error("APPROVE USER ERROR:", userError);
    return;
  }

  // 2. Remove from pending_users
  await supabase.from("pending_users").delete().eq("email", email);

  // 3. Send magic link (players only)
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email
  );

  if (inviteError) {
    console.error("MAGIC LINK ERROR:", inviteError);
  }
}

// ⭐ DENY USER
export async function denyUser(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase();
  if (!email) return;

  await supabase.from("pending_users").delete().eq("email", email);
}
