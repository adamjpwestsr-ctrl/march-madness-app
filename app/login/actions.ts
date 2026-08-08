"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Regular user login — direct email login (no magic link)
 */
export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) return { status: "missingEmail" };

  const supabase = await createSupabaseServerClient();

  // Check if user exists in your users table
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (dbError) {
    console.error("DB lookup error:", dbError);
    return { status: "error" };
  }

  // If user does NOT exist → commissioner approval flow
  if (!dbUser) {
    // Insert into pending approvals table
    await supabase.from("pending_users").insert({ email });

    // TODO: send commissioner email notification
    // sendCommissionerApprovalRequest(email);

    return { status: "pendingApproval", email };
  }

  // If user IS admin → require admin code
  if (dbUser.is_admin) {
    return { status: "needsAdminCode", email };
  }

  // User exists → log them in using auth_id as password
  const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: dbUser.auth_id, // your private credential
  });

  if (loginError) {
    console.error("Direct login error:", loginError);
    return { status: "error" };
  }

  return { status: "success" };
}

/**
 * Admin login — verifies admin code (no magic link)
 */
export async function verifyAdminCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const adminCode = formData.get("adminCode")?.toString().trim();

  if (!email || !adminCode) return { status: "missingFields" };

  const supabase = await createSupabaseServerClient();

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

  // Admin code correct → log in using auth_id
  const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: dbUser.auth_id,
  });

  if (loginError) {
    console.error("Admin login error:", loginError);
    return { status: "error" };
  }

  return { status: "success" };
}
