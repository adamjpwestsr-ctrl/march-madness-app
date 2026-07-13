"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Regular user login — sends magic link.
 */
export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) return { status: "missingEmail" };

  const supabase = await createSupabaseServerClient();

  // ⭐ Clear stale session BEFORE login
  await supabase.auth.signOut();

  // Check if user exists
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (dbError) {
    console.error("DB lookup error:", dbError);
    return { status: "error" };
  }

  // ⭐ Admins must enter admin code
  if (dbUser?.is_admin) {
    return { status: "needsAdminCode", email };
  }

  // ⭐ Send magic link (Supabase will create auth user)
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (otpError) {
    console.error("OTP login error:", otpError);
    return { status: "error" };
  }

  // ⭐ If new user → callback will create DB row
  if (!dbUser) {
    return { status: "needsName", email };
  }

  return { status: "success" };
}

/**
 * Admin login — verifies admin code then sends magic link.
 */
export async function verifyAdminCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const adminCode = formData.get("adminCode")?.toString().trim();

  if (!email || !adminCode) return { status: "missingFields" };

  const supabase = await createSupabaseServerClient();

  // ⭐ Clear stale session BEFORE admin login
  await supabase.auth.signOut();

  // Lookup admin
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (dbError || !dbUser?.is_admin) {
    return { status: "notAdmin" };
  }

  if (dbUser.admin_code !== adminCode) {
    return { status: "invalidAdminCode" };
  }

  // ⭐ Send magic link for admin login
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (otpError) {
    console.error("Admin OTP error:", otpError);
    return { status: "error" };
  }

  return { status: "success" };
}
