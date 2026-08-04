// lib/getCurrentUserSession.ts
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function getCurrentUserSession() {
  const supabase = await createSupabaseServerClient();

  // ⭐ Get Supabase Auth session
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // ⭐ Look up user row using auth_id (UUID)
  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (!dbUser) {
    return null;
  }

  return {
    authId: authUser.id,        // UUID
    email: authUser.email,
    userId: dbUser.user_id,     // internal numeric ID
    username: dbUser.username,
    isAdmin: dbUser.is_admin ?? false,
  };
}
