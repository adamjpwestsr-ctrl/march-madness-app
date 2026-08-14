"use server";

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * LOGIN FLOW (NO PASSWORDS)
 *
 * 1. User enters email
 * 2. If user exists → login
 * 3. If user is admin → require admin code
 * 4. If user is pending → redirect to /pending
 * 5. If user does not exist → add to pending_users
 */

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) {
    return { status: "missingEmail" };
  }

  const supabase = await createSupabaseServerClient();

  // 1. Check if user exists
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  // 2. If user exists → login or admin flow
  if (user) {
    if (user.is_admin) {
      return { status: "needsAdminCode", email };
    }

    // ⭐ Generate Supabase session token
    const { data: tokenData, error: tokenErr } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (tokenErr) {
      console.error("Supabase token generation failed:", tokenErr);
      return { status: "error", message: "Failed to generate Supabase session." };
    }

    const supabaseToken =
      tokenData.properties?.action_link?.split("token=")[1];

    // ⭐ Set your custom mm_session cookie
    const cookieStore = await cookies();
    cookieStore.set(
      "mm_session",
      JSON.stringify({
        userId: user.user_id,
        email: user.email,
        isAdmin: user.is_admin,
      }),
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      }
    );

    // ⭐ Return Supabase token to client
    return { status: "success", supabaseToken };
  }

  // 3. If user is pending approval
  const { data: pending } = await supabase
    .from("pending_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (pending) {
    return { status: "pendingApproval" };
  }

  // 4. If user does not exist → add to pending_users
  await supabase.from("pending_users").insert({ email });

  return { status: "pendingApproval" };
}

/**
 * ADMIN CODE VERIFICATION
 */
export async function verifyAdminCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const code = formData.get("adminCode")?.toString().trim();

  if (!email || !code) {
    return { status: "missingFields" };
  }

  const supabase = await createSupabaseServerClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!user || !user.is_admin) {
    return { status: "notAdmin" };
  }

  if (user.admin_code !== code) {
    return { status: "invalidAdminCode" };
  }

  // ⭐ Generate Supabase session token
  const { data: tokenData, error: tokenErr } =
    await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (tokenErr) {
    console.error("Supabase token generation failed:", tokenErr);
    return { status: "error", message: "Failed to generate Supabase session." };
  }

  const supabaseToken =
    tokenData.properties?.action_link?.split("token=")[1];

  // ⭐ Set your custom mm_session cookie
  const cookieStore = await cookies();
  cookieStore.set(
    "mm_session",
    JSON.stringify({
      userId: user.user_id,
      email: user.email,
      isAdmin: true,
    }),
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    }
  );

  return { status: "success", supabaseToken };
}
