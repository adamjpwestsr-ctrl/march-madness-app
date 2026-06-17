"use server";

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Sends a welcome email using Supabase's built-in template.
 * You can customize this template in your Supabase dashboard under Authentication → Email Templates.
 */
async function sendWelcomeEmail(email: string) {
  try {
    const supabase = await createSupabaseServerClient();

    // Trigger a "magic link" style email purely for onboarding — not for login.
    // This uses your existing template but does NOT require the user to click it.
    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // prevents auth session creation
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`, // harmless redirect
      },
    });

    console.log(`📧 Welcome email sent to ${email}`);
  } catch (err) {
    console.error("Welcome email error:", err);
  }
}

/**
 * Regular user login — instant access, no magic link required.
 */
export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) return { status: "missingEmail" };

  const supabase = await createSupabaseServerClient();

  // Look up user
  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("user_id, email, is_admin")
    .eq("email", email)
    .maybeSingle();

  if (userError) {
    console.error("DB lookup error:", userError);
    return { status: "error" };
  }

  let userRecord = dbUser;

  // Create user if not found
  if (!dbUser) {
    const username = email.split("@")[0];
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        username,
        name: null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("User insert error:", insertError);
      return { status: "error" };
    }

    userRecord = newUser;

    // Send welcome email asynchronously
    await sendWelcomeEmail(email);
  }

  // Admins must enter admin code
  if (userRecord?.is_admin) {
    return { status: "needsAdminCode", email };
  }

  // Set session cookie for immediate access
  const cookieStore = await cookies();
  cookieStore.set(
    "mm_session",
    JSON.stringify({
      userId: userRecord.user_id,
      email: userRecord.email,
      isAdmin: userRecord.is_admin ?? false,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }
  );

  return { status: "success" };
}

/**
 * Admin login — verifies admin code and sets session cookie.
 */
export async function verifyAdminCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const adminCode = formData.get("adminCode")?.toString().trim();

  if (!email || !adminCode) return { status: "missingFields" };

  const supabase = await createSupabaseServerClient();

  // Validate admin
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

  // Login using admin code as password
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: adminCode,
  });

  if (authError) {
    console.error("Admin login error:", authError);
    return { status: "invalidCredentials" };
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set(
    "mm_session",
    JSON.stringify({
      userId: dbUser.user_id,
      email: dbUser.email,
      isAdmin: true,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }
  );

  return { status: "success" };
}
