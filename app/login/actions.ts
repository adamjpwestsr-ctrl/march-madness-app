"use server";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Sends a welcome email using Supabase's built-in template.
 * Uses the BROWSER client to avoid cookie-write errors in server actions.
 */
async function sendWelcomeEmail(email: string) {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    console.log(`📧 Welcome email sent to ${email}`);
  } catch (err) {
    console.error("Welcome email error:", err);
  }
}

/**
 * Regular user login — instant access, no magic link required.
 * This DOES NOT rely on Supabase Auth session; it uses email as app identity.
 */
export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) return { status: "missingEmail" };

  const supabase = await supabaseServerClient();

  // Always generate username from email
  const username = email.split("@")[0];

  // Look up user purely by email
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

    // Redirect brand‑new users to name setup
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

  // Runtime safety guard
  if (!userRecord) {
    console.error("Unexpected null userRecord");
    return { status: "error" };
  }

  return { status: "success" };
}

/**
 * Admin login — verifies admin code and sets Supabase Auth session.
 */
export async function verifyAdminCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const adminCode = formData.get("adminCode")?.toString().trim();

  if (!email || !adminCode) return { status: "missingFields" };

  const supabase = await supabaseServerClient();

  // Fetch admin record by email
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

  // Login using admin code as password (this sets the Supabase Auth session)
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

  return { status: "success" };
}
