"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) return { status: "missingEmail" };

  const supabase = await createSupabaseServerClient();

  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("user_id, email, is_admin, admin_code")
    .eq("email", email)
    .maybeSingle();

  if (userError) {
    console.error("DB lookup error:", userError);
    return { status: "error" };
  }

  if (dbUser?.is_admin) {
    return { status: "needsAdminCode", email };
  }

  const { error: magicError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (magicError) {
    console.error("Magic link error:", magicError);
    return { status: "error" };
  }

  return { status: "magicLinkSent" };
}

export async function verifyAdminCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const adminCode = formData.get("adminCode")?.toString().trim();

  if (!email || !adminCode) return { status: "missingFields" };

  const supabase = await createSupabaseServerClient();

  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("user_id, email, is_admin, admin_code")
    .eq("email", email)
    .maybeSingle();

  if (userError || !dbUser?.is_admin) {
    return { status: "notAdmin" };
  }

  if (adminCode !== dbUser.admin_code) {
    return { status: "invalidAdminCode" };
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: adminCode,
  });

  if (authError) {
    console.error("Admin login error:", authError);
    return { status: "invalidCredentials" };
  }

  return { status: "success" };
}
