"use server";

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Sends a welcome email using Supabase's built-in template.
 */
async function sendWelcomeEmail(email: string) {
  try {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
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

  // Always generate username from email
  const username = email.split("@")[0];

  // Fetch the most recent user record (prevents stale duplicates)
  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("user_id, email, username, name, is_admin")
    .eq("email", email)
    .order("user_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (userError) {
    console.error("DB lookup error:", userError);
    return { status: "error" };
  }

  let userRecord = dbUser;

  // Create user if not found
  if (!dbUser) {
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

    // ⭐ NEW — redirect brand‑new users to name setup
    return { status: "needsName", email };
  }

  // If user exists but username is null, fix it
  if (dbUser && !dbUser.username) {
    await supabase
      .from("users")
      .update({ username })
      .eq("user_id", dbUser.user_id);
  }

  // Admins must enter admin code
  if (userRecord?.is_admin) {
    return { status: "needsAdminCode", email };
  }

  // Set session cookie
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

  // Fetch most recent admin record
  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("user_id, email, username, is_admin, admin_code")
    .eq("email", email)
    .order("user_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (userError || !dbUser?.is_admin) {
    return { status: "notAdmin" };
  }

  if (adminCode !== dbUser.admin_code) {
    return { status: "invalidAdminCode" };
  }

  // Login using admin code as password
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: adminCode,
  });

  if (authError) {
    console.error("Admin login error:", authError);
    return { status: "invalidCredentials" };
  }

  // Ensure admin has a username
  const username = email.split("@")[0];
  if (!dbUser.username) {
    await supabase
      .from("users")
      .update({ username })
      .eq("user_id", dbUser.user_id);
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
