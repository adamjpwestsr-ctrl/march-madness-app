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
    return { status: "error", message: "Email is required." };
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

    // ⭐ FIXED: Next.js 16 requires awaiting cookies()
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

    return { status: "success" };
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
    return { status: "error", message: "Missing email or admin code." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!user || !user.is_admin) {
    return { status: "error", message: "Not an admin." };
  }

  if (user.admin_code !== code) {
    return { status: "invalidCode" };
  }

  // ⭐ FIXED: Next.js 16 requires awaiting cookies()
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

  return { status: "success" };
}